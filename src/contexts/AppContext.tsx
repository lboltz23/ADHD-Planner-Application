// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Task, CreateTaskParams, Weekday, UpdateTaskParams, toLocalDateString, toLocalTimeString, combineAsDate } from '../types';
import { SettingsData } from '../components/Settings';
import { supabase } from '@/lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { preventAutoHideAsync } from 'expo-router/build/utils/splash';

// Parse a date string from Supabase as a LOCAL date (avoids UTC timezone shift)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

function parseLocalTime(dateStr: string): Date {
  const timePart = dateStr.split('T')[1];

  if (!timePart) {
    throw new Error("No time found in date string");
  }

  const cleanTime = timePart.split('.')[0]; // remove milliseconds if present
  const [h, m, s] = cleanTime.split(':').map(Number);

  return new Date(1970, 0, 1, h || 0, m || 0, s || 0);
}


// Map JavaScript day numbers (0=Sunday) to Weekday names
const DAY_NUMBER_TO_WEEKDAY: Record<number, Weekday> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

interface AppContextType {
  tasks: Task[];
  settings: SettingsData;
  addTask: (params: CreateTaskParams) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, fields: { title?: string; due_date?: Date; notes?: string; time?: Date; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
  deleteTask: (id: string) => void;
  updateSettings: (newSettings: SettingsData) => void;
  streakCount: number;
  login: () => void;
  confettiTrigger: number;
  triggerConfetti: () => void;
  fetchTasksForMonth: (year: number, month: number) => Promise<Task[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [settings, setSettings] = useState<SettingsData>({
    defaultTimerMinutes: 25,
    soundEnabled: true,
    confettiEnabled: true,
    theme: "auto",
    defaultTaskView: "all",
    colorBlindMode: false,
  });

  const [streakCount, setStreakCount] = useState<number>(0);
  const [lastLoginDate, setLastLoginDate] = useState<Date | null>(null);

  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Default user ID - replace with actual user ID when auth is implemented
  const DEFAULT_USER_ID = '9dfa5616-322a-4287-a980-d33754320861';

  // Helper function to generate task instances from a recurring template
  const generateTaskInstancesFromTemplate = (template: any): Task[] => {
    if (!template.start_date) return [];
    // Parse dates as LOCAL to avoid UTC timezone shift
    const startDate = typeof template.start_date === 'string'
      ? parseLocalDate(template.start_date)
      : template.start_date;
    const endDate = template.end_date
      ? (typeof template.end_date === 'string' ? parseLocalDate(template.end_date) : template.end_date)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate());
    const daysSelected = template.days_selected as Weekday[] | undefined;
    const intervalMonths = template.recurrence_interval as number | undefined;
    const createdAt = typeof template.created_at === 'string' ? new Date(template.created_at) : template.created_at;
    const updatedAt = typeof template.updated_at === 'string' ? new Date(template.updated_at) : template.updated_at;
    const completedDates: string[] = template.completed_dates || [];
    const excludedDates: string[] = template.excluded_dates || [];

    const scheduledDays = generateScheduledDays(startDate, endDate, daysSelected, intervalMonths);

    return scheduledDays
      .filter((scheduledDate) => {
        const dateStr = toLocalDateString(scheduledDate);
        return !excludedDates.includes(dateStr);
      })
      .map((scheduledDate) => {
      // Use local date format to avoid UTC shift (e.g., "2025-02-15" not "2025-02-14")
      const dateStr = toLocalDateString(scheduledDate);
      const isCompleted = completedDates.includes(dateStr);

      return {
        id: `${template.id}_${dateStr}`, // Unique ID per instance
        user_id: template.user_id,
        title: template.title,
        due_date: scheduledDate,
        time: scheduledDate,
        completed: isCompleted,
        type: template.type as Task['type'],
        notes: template.notes,
        created_at: createdAt,
        updated_at: updatedAt,
        is_template: false,
        parent_task_id: template.id, // Reference to the parent template
        days_selected: daysSelected,
        recurrence_interval: intervalMonths,
        start_date: startDate,
        end_date: endDate,
      };
    });
  };

  // Load tasks from Supabase on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', DEFAULT_USER_ID);

        if (error) {
          console.error('Error loading tasks from Supabase:', error);
          return;
        }

        if (data) {
          const allTasks: Task[] = [];

          // Collect override rows (persisted instance edits) keyed by parent_task_id
          // Each entry maps a template ID to a set of due_date strings that have overrides
          const overridesByTemplate = new Map<string, Map<string, any>>();

          data.forEach((row: any) => {
            // Recurring instance overrides have parent_task_id but are NOT "related" type
            if (!row.is_template && row.parent_task_id && row.type !== 'related') {
              if (!overridesByTemplate.has(row.parent_task_id)) {
                overridesByTemplate.set(row.parent_task_id, new Map());
              }
              const dateStr = row.due_date ? toLocalDateString(parseLocalDate(row.due_date)) : '';
              overridesByTemplate.get(row.parent_task_id)!.set(dateStr, row);
            }
          });

          data.forEach((row: any) => {
            // Skip recurring override rows — they're handled during instance generation
            if (!row.is_template && row.parent_task_id && row.type !== 'related') return;

            // Check if this is a recurring template
            if (row.is_template && row.start_date) {
              // Add the template itself for the Repeating view
              allTasks.push({
                id: row.id,
                title: row.title,
                user_id: row.user_id,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
                due_date: parseLocalDate(row.due_date),
                time:parseLocalTime(row.due_date),
                completed: false,
                type: row.type as Task['type'],
                notes: row.notes,
                is_template: true,
                days_selected: row.days_selected,
                recurrence_interval: row.recurrence_interval,
                start_date: parseLocalDate(row.start_date),
                end_date: row.end_date ? parseLocalDate(row.end_date) : undefined,
              });

              // Generate instances from the template, skipping dates with override rows
              const instances = generateTaskInstancesFromTemplate(row);
              const templateOverrides = overridesByTemplate.get(row.id);

              instances.forEach(instance => {
                const dateStr = toLocalDateString(instance.due_date);
                if (templateOverrides?.has(dateStr)) {
                  // Use the persisted override row instead of the generated instance
                  const override = templateOverrides.get(dateStr)!;
                  allTasks.push({
                    id: override.id,
                    title: override.title,
                    user_id: override.user_id,
                    created_at: new Date(override.created_at),
                    updated_at: new Date(override.updated_at),
                    due_date: new Date(override.due_date),
                    time:parseLocalTime(override.due_date),
                    completed: override.completed || false,
                    type: override.type as Task['type'],
                    notes: override.notes,
                    is_template: false,
                    parent_task_id: override.parent_task_id,
                  });
                } else {
                  allTasks.push(instance);
                }
              });
            } else {
              // Regular non-recurring task (basic or related)
              allTasks.push({
                id: row.id,
                title: row.title,
                user_id: row.user_id,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
                due_date: new Date(row.due_date),
                time:parseLocalTime(row.due_date),
                completed: row.completed || false,
                type: row.type as Task['type'],
                notes: row.notes,
                is_template: false,
                parent_task_id: row.parent_task_id || undefined,
              });
            }
          });

          setTasks(allTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, []);

  // Helper function to generate scheduled days for recurring tasks
  const generateScheduledDays = (
    startDate: Date,
    endDate: Date,
    repeatDays?: Weekday[],
    intervalMonths?: number
  ): Date[] => {
    const scheduledDays: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    // Set times to midnight for consistent comparison
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // If repeatDays is provided (routine tasks), filter by selected weekdays
    if (repeatDays && repeatDays.length > 0) {
      while (current <= end) {
        const dayOfWeek = DAY_NUMBER_TO_WEEKDAY[current.getDay()];
        if (repeatDays.includes(dayOfWeek)) {
          scheduledDays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (intervalMonths) {
      // For long_interval tasks, use intervalMonths
      while (current <= end) {
        scheduledDays.push(new Date(current));
        current.setMonth(current.getMonth() + intervalMonths);
      }
    } else {
      // Default to monthly if no repeat days or interval specified
      while (current <= end) {
        scheduledDays.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
    }

    return scheduledDays;
  };

  const addTask = useCallback(async (params: CreateTaskParams) => {
    const { title, time, due_date, type, days_selected, recurrence_interval, notes, start_date, end_date, parent_task_id } = params;
    const baseId = uuidv4();
    const now = new Date();

    // Check if this is a recurring task
    if (type === "routine" || type === "long_interval") {
      // Store only ONE template task in Supabase with is_template = true
      const templateTask: Record<string, any> = {
        id: baseId,
        title,
        type,
        notes: notes,
        user_id: DEFAULT_USER_ID,
        is_template: true,
        start_date: start_date ? toLocalDateString(start_date) : null,
        end_date: end_date ? toLocalDateString(end_date) : null,
        days_selected: days_selected,
        recurrence_interval: recurrence_interval,
        due_date: toLocalDateString(start_date || due_date) + toLocalTimeString(time || due_date),
        completed: false,
      };

      const { error } = await supabase.from('tasks').insert(templateTask);
      if (error) {
        console.error('Error inserting recurring task template:', error);
      } else {
        // Add template to local state
        const templateForState: Task = {
          id: baseId,
          user_id: DEFAULT_USER_ID,
          title,
          time: time || due_date,
          due_date: start_date || due_date,
          completed: false,
          type,
          notes,
          created_at: now,
          updated_at: now,
          is_template: true,
          days_selected,
          recurrence_interval,
          start_date: start_date || undefined,
          end_date: end_date || undefined,
        };
        // Generate instances locally for display (only if both dates exist)
        const instances = generateTaskInstancesFromTemplate({
          ...templateTask,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
        setTasks(prev => [...prev, templateForState, ...instances]);
      }
    } else {
      // Regular non-recurring task (basic or related)
      const newTask: Task = {
        id: baseId,
        user_id: DEFAULT_USER_ID,
        title,
        time:time,
        due_date: due_date,
        completed: false,
        type,
        notes,
        created_at: now,
        updated_at: now,
        is_template: false,
        parent_task_id: type === "related" ? parent_task_id : undefined,
      };

      // Insert into Supabase
      const { error } = await supabase.from('tasks').insert({
        id: newTask.id,
        title: newTask.title,
        due_date: toLocalDateString(newTask.due_date) + toLocalTimeString(newTask.time || new Date()),
        completed: newTask.completed,
        type: newTask.type,
        notes: newTask.notes,
        user_id: DEFAULT_USER_ID,
        is_template: false,
        parent_task_id: newTask.parent_task_id,
      });

      if (error) {
        console.error('Error inserting task:', error);
      } else {
        setTasks(prev => [...prev, newTask]);
      }
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    // Find the task to determine if it's a recurring instance
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompletedState = !task.completed;

    // Optimistically update UI first
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: newCompletedState } : t
    ));

    // Check if this is a recurring task instance (has a parent_task_id, but not a "related" task)
    const isRecurringInstance = task.is_template === false && task.parent_task_id && task.type !== 'related';
    const isInMemoryInstance = isRecurringInstance && id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(id);

    if (isRecurringInstance && !isInMemoryInstance) {
      // Persisted override row — update its own completed field directly
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedState })
        .eq('id', id);

      if (error) {
        console.error('Error toggling persisted override:', error);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, completed: !newCompletedState } : t
        ));
      }
    } else if (isInMemoryInstance) {
      // In-memory instance — update the template's completed_dates
      const dateStr = toLocalDateString(task.due_date);

      const { data: templateData, error: fetchError } = await supabase
        .from('tasks')
        .select('completed_dates')
        .eq('id', task.parent_task_id)
        .single();

      if (fetchError) {
        console.error('Error fetching template:', fetchError);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, completed: !newCompletedState } : t
        ));
        return;
      }

      const currentCompletedDates: string[] = templateData?.completed_dates || [];
      let updatedCompletedDates: string[];

      if (newCompletedState) {
        if (!currentCompletedDates.includes(dateStr)) {
          updatedCompletedDates = [...currentCompletedDates, dateStr];
        } else {
          updatedCompletedDates = currentCompletedDates;
        }
      } else {
        updatedCompletedDates = currentCompletedDates.filter(d => d !== dateStr);
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ completed_dates: updatedCompletedDates })
        .eq('id', task.parent_task_id);

      if (updateError) {
        console.error('Error updating completed_dates:', updateError);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, completed: !newCompletedState } : t
        ));
      }
    } else {
      // Regular non-recurring task - update completed field directly
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedState })
        .eq('id', id);

      if (error) {
        console.error('Error toggling task:', error);
        // Revert on error
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, completed: !newCompletedState } : t
        ));
      }
    }
  }, [tasks]);


  const updateTask = useCallback(async (id: string, fields: { time?: Date, title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTitle = fields.title ?? task.title;
    const newDate = fields.due_date ?? task.due_date;
    const newTime = fields.time ?? task.time;
    const newNotes = fields.notes ?? task.notes;
    const newStartDate = fields.start_date ?? task.start_date;
    const newEndDate = fields.end_date ?? task.end_date;
    const newInterval = fields.recurrence_interval ?? task.recurrence_interval;
    const newParentId = fields.parent_id ?? task.parent_task_id;
    const newDaysSelected = fields.days_selected ?? task.days_selected;

    // Build the Supabase update payload (only changed fields)
    const supabaseUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
    if (fields.title !== undefined) supabaseUpdate.title = fields.title;
    if (fields.due_date !== undefined || fields.time !== undefined) {
        const baseDate = fields.due_date ?? task.due_date;
        const baseTime = fields.time ?? task.time ?? task.due_date;

        supabaseUpdate.due_date =
          toLocalDateString(baseDate) +
          toLocalTimeString(baseTime);
      }
    if (fields.notes !== undefined) supabaseUpdate.notes = fields.notes;
    if (fields.parent_id !== undefined) supabaseUpdate.parent_task_id = fields.parent_id;
    if (fields.start_date !== undefined) supabaseUpdate.start_date = toLocalDateString(fields.start_date);
    if (fields.end_date !== undefined) supabaseUpdate.end_date = toLocalDateString(fields.end_date);
    if (fields.recurrence_interval !== undefined) supabaseUpdate.recurrence_interval = fields.recurrence_interval;
    if (fields.days_selected !== undefined) supabaseUpdate.days_selected = fields.days_selected;

    // Local state update object
    const localUpdate: Partial<Task> = { updated_at: new Date() };
    if (fields.title !== undefined) localUpdate.title = fields.title;
    if (fields.due_date !== undefined || ) localUpdate.due_date = fields.due_date;
    if (fields.notes !== undefined) localUpdate.notes = fields.notes;
    if (fields.parent_id !== undefined) localUpdate.parent_task_id = fields.parent_id;
    if (fields.start_date !== undefined) localUpdate.start_date = fields.start_date;
    if (fields.end_date !== undefined) localUpdate.end_date = fields.end_date;
    if (fields.recurrence_interval !== undefined) localUpdate.recurrence_interval = fields.recurrence_interval;
    if (fields.days_selected !== undefined) localUpdate.days_selected = fields.days_selected;


    const isRecurringInstance = task.parent_task_id && !task.is_template && task.type !== 'related';
    const isInMemoryInstance = isRecurringInstance && id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(id);

    // Optimistically update UI
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...localUpdate } : t
    ));

    if (isInMemoryInstance) {
      // In-memory instance — insert a new persisted override row
      const newId = uuidv4();
      const now = new Date();

      const overrideRow = {
        id: newId,
        title: newTitle,
        type: task.type,
        due_date: toLocalDateString(newDate),
        time: toLocalTimeString(newTime || newDate),
        completed: task.completed,
        user_id: task.user_id,
        is_template: false,
        parent_task_id: task.parent_task_id,
        notes: newNotes || null,
        start_date: newStartDate ? toLocalDateString(newStartDate) : null,
        end_date: newEndDate ? toLocalDateString(newEndDate) : null,
        recurrence_interval: newInterval || null,
      };

      const { error } = await supabase.from('tasks').insert(overrideRow);

      if (error) {
        console.error('Error inserting recurring instance override:', error);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, title: task.title, due_date: task.due_date, notes: task.notes } : t
        ));
        return;
      }

      // Replace the synthetic instance with the persisted one
      setTasks(prev => prev.map(t =>
        t.id === id
          ? { ...t, id: newId, created_at: now, updated_at: now }
          : t
      ));
    } else if (isRecurringInstance) {
      // Persisted override row — update it
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating recurring instance override:', error);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, title: task.title, due_date: task.due_date, notes: task.notes } : t
        ));
      }
    } else if (task.is_template) {
      // Template — update and propagate title to in-memory instances
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating template:', error);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, title: task.title, due_date: task.due_date, notes: task.notes } : t
        ));
        return;
      }

      // Check if any schedule fields changed — if so, regenerate all in-memory instances
      const scheduleChanged =
        fields.start_date !== undefined ||
        fields.end_date !== undefined ||
        fields.days_selected !== undefined ||
        fields.recurrence_interval !== undefined;

      if (scheduleChanged) {
        // Build an updated template object for instance generation
        const updatedTemplate = {
          id,
          user_id: task.user_id,
          title: newTitle,
          type: task.type,
          notes: newNotes,
          start_date: newStartDate ? toLocalDateString(newStartDate) : null,
          end_date: newEndDate ? toLocalDateString(newEndDate) : null,
          days_selected: newDaysSelected,
          recurrence_interval: newInterval,
          completed_dates: task.completed_dates || [],
          excluded_dates: task.excluded_dates || [],
          created_at: task.created_at.toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newInstances = generateTaskInstancesFromTemplate(updatedTemplate);

        // Remove old in-memory instances and add regenerated ones
        setTasks(prev => {
          const withoutOldInstances = prev.filter(t => {
            if (t.parent_task_id === id && t.id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(t.id)) {
              return false; // Remove old in-memory instances
            }
            return true;
          });
          return [...withoutOldInstances, ...newInstances];
        });
      } else {
        // Propagate title change to in-memory instances
        if (fields.title !== undefined) {
          setTasks(prev => prev.map(t => {
            if (t.parent_task_id === id && t.id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(t.id)) {
              return { ...t, title: fields.title! };
            }
            return t;
          }));
        }
        // Propagate notes change to in-memory instances
        if (fields.notes !== undefined) {
          setTasks(prev => prev.map(t => {
            if (t.parent_task_id === id && t.id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(t.id)) {
              return { ...t, notes: fields.notes! };
            }
            return t;
          }));
        }
      }
    } else {
      // Regular non-recurring task — update directly
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, title: task.title, due_date: task.due_date, notes: task.notes } : t
        ));
      }
    }
  }, [tasks]);

  const updateSettings = useCallback((newSettings: SettingsData) => {
    setSettings(newSettings);
  }, []);

  const triggerConfetti = useCallback(() => {
    setConfettiTrigger(prev => prev + 1);
  }, []);

  const fetchTasksForMonth = useCallback(async (year: number, month: number): Promise<Task[]> => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month, end of day

    // Use local date strings for Supabase queries (padded by 1 day for safety)
    const queryStart = toLocalDateString(new Date(year, month, 0)); // Day before month start
    const queryEnd = toLocalDateString(new Date(year, month + 1, 1)); // Day after month end

    try {
      // Fetch regular (non-template) tasks with due_date in this month (padded)
      const { data: regularData, error: regularError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('is_template', false)
        .gte('due_date', queryStart)
        .lte('due_date', queryEnd);

      if (regularError) {
        console.error('Error fetching regular tasks for month:', regularError);
        return [];
      }

      // Fetch recurring templates whose date range overlaps with this month (padded)
      const { data: templateData, error: templateError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('is_template', true)
        .lte('start_date', queryEnd)
        .or(`end_date.gte.${queryStart},end_date.is.null`);

      if (templateError) {
        console.error('Error fetching templates for month:', templateError);
        return [];
      }

      const result: Task[] = [];

      // Collect override rows (persisted instance edits) keyed by parent template ID
      const overridesByTemplate = new Map<string, Map<string, any>>();

      (regularData || []).forEach((row: any) => {
        // Recurring instance overrides have parent_task_id but are NOT "related" type
        if (row.parent_task_id && row.type !== 'related') {
          if (!overridesByTemplate.has(row.parent_task_id)) {
            overridesByTemplate.set(row.parent_task_id, new Map());
          }
          const dateStr = row.due_date ? toLocalDateString(parseLocalDate(row.due_date)) : '';
          overridesByTemplate.get(row.parent_task_id)!.set(dateStr, row);
        }
      });

      // Map regular tasks, skipping recurring override rows (handled during instance generation)
      (regularData || []).forEach((row: any) => {
        // Skip recurring override rows — they're handled below with template instances
        if (row.parent_task_id && row.type !== 'related') return;

        const dueDate = parseLocalDate(row.due_date);
        if (dueDate >= monthStart && dueDate <= monthEnd) {
          result.push({
            id: row.id,
            title: row.title,
            user_id: row.user_id,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            due_date: dueDate,
            time: parseLocalTime(row.due_date),
            completed: row.completed || false,
            type: row.type as Task['type'],
            notes: row.notes,
            is_template: false,
            parent_task_id: row.parent_task_id,
          });
        }
      });

      // Generate instances from templates, using persisted overrides where they exist
      (templateData || []).forEach((row: any) => {
        const instances = generateTaskInstancesFromTemplate(row);
        const templateOverrides = overridesByTemplate.get(row.id);

        instances.forEach(instance => {
          const d = instance.due_date;
          if (d < monthStart || d > monthEnd) return;

          const dateStr = toLocalDateString(d);
          if (templateOverrides?.has(dateStr)) {
            // Use the persisted override row instead of the generated instance
            const override = templateOverrides.get(dateStr)!;
            result.push({
              id: override.id,
              title: override.title,
              user_id: override.user_id,
              created_at: new Date(override.created_at),
              updated_at: new Date(override.updated_at),
              due_date: parseLocalDate(override.due_date),
              time: parseLocalTime(override.due_date),
              completed: override.completed || false,
              type: override.type as Task['type'],
              notes: override.notes,
              is_template: false,
              parent_task_id: override.parent_task_id,
            });
          } else {
            result.push(instance);
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Error in fetchTasksForMonth:', error);
      return [];
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isRecurringInstance = task.parent_task_id && !task.is_template && task.type !== 'related';
    const isInMemoryInstance = isRecurringInstance && id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(id);

    // Optimistically update UI
    setTasks(prev => prev.filter(t => {
      if (t.id === id) return false;
      // Remove generated instances if deleting a template
      if (task.is_template && t.parent_task_id === id) return false;
      return true;
    }));

    if (isInMemoryInstance) {
      // In-memory instance — add its date to the template's excluded_dates
      // so it won't regenerate on next load
      const dateStr = toLocalDateString(task.due_date);

      const { data: templateData, error: fetchError } = await supabase
        .from('tasks')
        .select('excluded_dates')
        .eq('id', task.parent_task_id)
        .single();

      if (fetchError) {
        console.error('Error fetching template for instance deletion:', fetchError);
        setTasks(prev => [...prev, task]);
        return;
      }

      const currentDates: string[] = templateData?.excluded_dates || [];
      if (!currentDates.includes(dateStr)) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ excluded_dates: [...currentDates, dateStr] })
          .eq('id', task.parent_task_id);

        if (updateError) {
          console.error('Error excluding instance date:', updateError);
          setTasks(prev => [...prev, task]);
        }
      }
      return;
    }

    if (isRecurringInstance) {
      // Persisted override row — delete it from Supabase and add its date to
      // the template's excluded_dates so it won't regenerate
      const dateStr = toLocalDateString(task.due_date);

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting override row:', deleteError);
        setTasks(prev => [...prev, task]);
        return;
      }

      const { data: templateData } = await supabase
        .from('tasks')
        .select('excluded_dates')
        .eq('id', task.parent_task_id)
        .single();

      const currentDates: string[] = templateData?.excluded_dates || [];
      if (!currentDates.includes(dateStr)) {
        await supabase
          .from('tasks')
          .update({ excluded_dates: [...currentDates, dateStr] })
          .eq('id', task.parent_task_id);
      }
      return;
    }

    // Unlink related tasks that reference this as their parent
    const relatedChildren = tasks.filter(t => t.parent_task_id === id && t.type === 'related');
    if (relatedChildren.length > 0) {
      const { error: unlinkError } = await supabase
        .from('tasks')
        .update({ parent_task_id: null })
        .eq('parent_task_id', id)
        .eq('type', 'related');

      if (unlinkError) {
        console.error('Error unlinking related tasks:', unlinkError);
      }

      // Clear parent_task_id locally for related children
      setTasks(prev => prev.map(t =>
        t.parent_task_id === id && t.type === 'related'
          ? { ...t, parent_task_id: undefined }
          : t
      ));
    }

    // Delete persisted instance overrides if this is a template
    if (task.is_template) {
      const { error: overrideError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_task_id', id)
        .neq('type', 'related');

      if (overrideError) {
        console.error('Error deleting instance overrides:', overrideError);
      }
    }

    // Delete the task itself from Supabase
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      // Revert — add the task back to local state
      setTasks(prev => [...prev, task]);
    }
  }, [tasks]);

  const updateStreak = () => {
    const today = new Date();
    if (lastLoginDate) {
      const diffTime = Math.abs(today.getTime() - lastLoginDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        setStreakCount(prev => prev + 1);
      } else if (diffDays > 1) {
        setStreakCount(1);
      }
    } else {
      setStreakCount(1);
    }
    setLastLoginDate(today);
  };

  const login = () => {
    updateStreak();
  };

  // Call login() whenever the user logs in

  return (
    <AppContext.Provider
      value={{
        tasks,
        settings,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        updateSettings,
        streakCount,
        login,
        confettiTrigger,
        triggerConfetti,
        fetchTasksForMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
