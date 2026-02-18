// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Task, CreateTaskParams, Weekday, UpdateTaskParams } from '../types';
import { SettingsData } from '../components/Settings';
import { supabase } from '@/lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Parse a date string from Supabase as a LOCAL date (avoids UTC timezone shift)
// e.g., "2025-02-15T00:00:00+00:00" → Feb 15 local, not Feb 14
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format a local Date as "YYYY-MM-DD" without going through UTC
// e.g., local Feb 15 → "2025-02-15", not "2025-02-14" (which toISOString might produce)
function formatLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  updateTask: (id: string, fields: { title?: string; due_date?: Date; notes?: string }) => void;
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

    const scheduledDays = generateScheduledDays(startDate, endDate, daysSelected, intervalMonths);

    return scheduledDays.map((scheduledDate) => {
      // Use local date format to avoid UTC shift (e.g., "2025-02-15" not "2025-02-14")
      const dateStr = formatLocalDateStr(scheduledDate);
      const isCompleted = completedDates.includes(dateStr);

      return {
        id: `${template.id}_${dateStr}`, // Unique ID per instance
        user_id: template.user_id,
        title: template.title,
        due_date: scheduledDate,
        completed: isCompleted,
        type: template.type as Task['type'],
        notes: template.description,
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

          data.forEach((row: any) => {
            // Check if this is a recurring template
            if (row.is_template && row.start_date && row.end_date) {
              // Add the template itself for the Repeating view
              allTasks.push({
                id: row.id,
                title: row.title,
                user_id: row.user_id,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
                due_date: parseLocalDate(row.due_date),
                completed: false,
                type: row.type as Task['type'],
                notes: row.description,
                is_template: true,
                days_selected: row.days_selected,
                recurrence_interval: row.recurrence_interval,
                start_date: parseLocalDate(row.start_date),
                end_date: parseLocalDate(row.end_date),
              });
              // Generate instances from the template
              const instances = generateTaskInstancesFromTemplate(row);
              allTasks.push(...instances);
            } else {
              // Regular non-recurring task
              allTasks.push({
                id: row.id,
                title: row.title,
                user_id: row.user_id,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
                due_date: parseLocalDate(row.due_date),
                completed: row.completed || false,
                type: row.type as Task['type'],
                notes: row.description,
                is_template: false,
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
      // Default to daily if nothing specified
      while (current <= end) {
        scheduledDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return scheduledDays;
  };

  const addTask = useCallback(async (params: CreateTaskParams) => {
    const { title, due_date, type, days_selected, recurrence_interval, notes, start_date, end_date, parent_task_id } = params;
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
        start_date: start_date ? formatLocalDateStr(start_date) : null,
        end_date: end_date ? formatLocalDateStr(end_date) : null,
        days_selected: days_selected,
        recurrence_interval: recurrence_interval,
        due_date: formatLocalDateStr(start_date || due_date),
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
        due_date: formatLocalDateStr(newTask.due_date),
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

    // Check if this is a recurring task instance (has a parent_task_id)
    if (task.is_template === false && task.parent_task_id) {
      // Extract the date as local YYYY-MM-DD (avoids UTC shift)
      const dateStr = formatLocalDateStr(task.due_date);

      // Get current completed_dates from Supabase
      const { data: templateData, error: fetchError } = await supabase
        .from('tasks')
        .select('completed_dates')
        .eq('id', task.parent_task_id)
        .single();

      if (fetchError) {
        console.error('Error fetching template:', fetchError);
        // Revert on error
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, completed: !newCompletedState } : t
        ));
        return;
      }

      const currentCompletedDates: string[] = templateData?.completed_dates || [];
      let updatedCompletedDates: string[];

      if (newCompletedState) {
        // Add date to completed_dates if not already present
        if (!currentCompletedDates.includes(dateStr)) {
          updatedCompletedDates = [...currentCompletedDates, dateStr];
        } else {
          updatedCompletedDates = currentCompletedDates;
        }
      } else {
        // Remove date from completed_dates
        updatedCompletedDates = currentCompletedDates.filter(d => d !== dateStr);
      }

      // Update the template's completed_dates in Supabase
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ completed_dates: updatedCompletedDates })
        .eq('id', task.parent_task_id);

      if (updateError) {
        console.error('Error updating completed_dates:', updateError);
        // Revert on error
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

  const updateTask = useCallback(async (id: string, fields: { title?: string; due_date?: Date; notes?: string }) => {
    // Optimistically update UI first
    const originalTask = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...fields } : task
    ));

    // Build Supabase update payload
    const supabaseFields: Record<string, any> = {};
    if (fields.title !== undefined) supabaseFields.title = fields.title;
    if (fields.due_date !== undefined) supabaseFields.due_date = formatLocalDateStr(fields.due_date);
    if (fields.notes !== undefined) supabaseFields.notes = fields.notes;

    const { error } = await supabase
      .from('tasks')
      .update(supabaseFields)
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      // Revert on error
      if (originalTask) {
        setTasks(prev => prev.map(task =>
          task.id === id ? originalTask : task
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
    const queryStart = formatLocalDateStr(new Date(year, month, 0)); // Day before month start
    const queryEnd = formatLocalDateStr(new Date(year, month + 1, 1)); // Day after month end

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
        .gte('end_date', queryStart);

      if (templateError) {
        console.error('Error fetching templates for month:', templateError);
        return [];
      }

      const result: Task[] = [];

      // Map regular tasks, parsing dates as local and filtering precisely
      (regularData || []).forEach((row: any) => {
        const dueDate = parseLocalDate(row.due_date);
        if (dueDate >= monthStart && dueDate <= monthEnd) {
          result.push({
            id: row.id,
            title: row.title,
            user_id: row.user_id,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            due_date: dueDate,
            completed: row.completed || false,
            type: row.type as Task['type'],
            notes: row.description,
            is_template: false,
            parent_task_id: row.parent_task_id,
          });
        }
      });

      // Generate instances from templates, filtered to this month
      (templateData || []).forEach((row: any) => {
        const instances = generateTaskInstancesFromTemplate(row);
        const monthInstances = instances.filter(inst => {
          const d = inst.due_date;
          return d >= monthStart && d <= monthEnd;
        });
        result.push(...monthInstances);
      });

      return result;
    } catch (error) {
      console.error('Error in fetchTasksForMonth:', error);
      return [];
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistically update UI first
    const originalTasks = tasks;
    setTasks(prev => prev.filter(task => task.id !== id));

    // Delete from Supabase
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      // Revert on error
      setTasks(originalTasks);
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
