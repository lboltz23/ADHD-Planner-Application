// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Task, CreateTaskParams, Weekday, UpdateTaskParams } from '../types';
import { SettingsData } from '../components/Settings';
import { supabase } from '@/lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

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
  rescheduleTask: (id: string, newDate: Date) => void;
  updateSettings: (newSettings: SettingsData) => void;
  confettiTrigger: number;
  triggerConfetti: () => void;
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

  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Default user ID - replace with actual user ID when auth is implemented
  // const DEFAULT_USER_ID = '9dfa5616-322a-4287-a980-d33754320861';

  // Helper function to generate task instances from a recurring template
  const generateTaskInstancesFromTemplate = (template: any): Task[] => {
    const startDate = new Date(template.start_date);
    const endDate = new Date(template.end_date);
    const daysSelected = template.days_selected as Weekday[] | undefined;
    const intervalMonths = template.recurrence_interval as number | undefined;
    const createdAt = new Date(template.created_at);
    const updatedAt = new Date(template.updated_at);
    const completedDates: string[] = template.completed_dates || [];

    const scheduledDays = generateScheduledDays(startDate, endDate, daysSelected, intervalMonths);

    return scheduledDays.map((scheduledDate) => {
      const dateStr = scheduledDate.toISOString().split('T')[0];
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
                due_date: new Date(row.due_date),
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
    if ((type === "routine" || type === "long_interval") && start_date && end_date) {
      // Store only ONE template task in Supabase with is_template = true
      const templateTask = {
        id: baseId,
        title,
        type,
        notes: notes,
        user_id: DEFAULT_USER_ID,
        is_template: true,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        days_selected: days_selected,
        recurrence_interval: recurrence_interval,
        due_date: start_date.toISOString(), // Use start_date as due_date for template
        completed: false,
      };

      const { error } = await supabase.from('tasks').insert(templateTask);
      if (error) {
        console.error('Error inserting recurring task template:', error);
      } else {
        // Generate instances locally for display
        const instances = generateTaskInstancesFromTemplate({
          ...templateTask,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
        setTasks(prev => [...prev, ...instances]);
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
        due_date: newTask.due_date.toISOString(),
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
    if (task.parent_task_id) {
      // Extract the date from the instance ID (format: templateId_YYYY-MM-DD)
      const dateStr = task.due_date.toISOString().split('T')[0];

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

  const rescheduleTask = useCallback(async (id: string, newDate: Date) => {
    // Optimistically update UI first
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, due_date: newDate } : task
    ));

    // Update in Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDate.toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error rescheduling task:', error);
      // Revert on error - find original date
      const originalTask = tasks.find(t => t.id === id);
      if (originalTask) {
        setTasks(prev => prev.map(task =>
          task.id === id ? { ...task, due_date: originalTask.due_date } : task
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

  const updateTask = (id: string, newTitle: string, newDate: Date) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle, date: newDate } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        settings,
        addTask,
        toggleTask,
        rescheduleTask,
        updateTask,
        deleteTask,
        updateSettings,
        confettiTrigger,
        triggerConfetti,
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
