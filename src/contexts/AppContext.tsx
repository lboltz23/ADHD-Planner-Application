// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Task, CreateTaskParams, Weekday } from '../types';
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
  rescheduleTask: (id: string, newDate: Date, newTime?: string) => void;
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
  const DEFAULT_USER_ID = '9dfa5616-322a-4287-a980-d33754320861';

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
          // Convert Supabase tasks to our Task type
          const loadedTasks: Task[] = data.map((row: any) => ({
            id: row.id,
            title: row.title,
            date: new Date(row.due_date),
            completed: row.completed || false,
            type: row.type as Task['type'],
            notes: row.description,
          }));
          setTasks(loadedTasks);
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
    const { title, date, type, repeatDays, intervalMonths, parentTaskId, notes, startDate, endDate } = params;
    const baseId = uuidv4();

    // Check if this is a recurring task
    if ((type === "routine" || type === "long_interval") && startDate && endDate) {
      // Generate scheduled days
      const scheduledDays = generateScheduledDays(
        startDate,
        endDate,
        repeatDays,
        intervalMonths
      );

      // Create individual task instances for each scheduled day
      const recurringTasks: Task[] = scheduledDays.map((scheduledDate) => ({
        id: uuidv4(),
        title,
        date: scheduledDate,
        completed: false,
        type,
        notes,
        repeatDays,
        intervalMonths,
        startDate,
        endDate,
        scheduledDays,
        isRecurring: true,
        recurringTaskId: baseId,
        instanceDate: scheduledDate,
      }));

      // Insert all recurring tasks into Supabase
      const supabaseTasks = recurringTasks.map(task => ({
        id: task.id,
        title: task.title,
        due_date: task.date.toISOString(),
        completed: task.completed,
        type: task.type,
        description: task.notes,
        user_id: DEFAULT_USER_ID,
      }));

      const { error } = await supabase.from('tasks').insert(supabaseTasks);
      if (error) {
        console.error('Error inserting recurring tasks:', error);
      } else {
        setTasks(prev => [...prev, ...recurringTasks]);
      }
    } else {
      // Regular non-recurring task
      const newTask: Task = {
        id: baseId,
        title,
        date,
        completed: false,
        type,
        notes,
        parentTaskId,
      };

      // Insert into Supabase
      const { error } = await supabase.from('tasks').insert({
        id: newTask.id,
        title: newTask.title,
        due_date: newTask.date.toISOString(),
        completed: newTask.completed,
        type: newTask.type,
        description: newTask.notes,
        user_id: DEFAULT_USER_ID,
      });

      if (error) {
        console.error('Error inserting task:', error);
      } else {
        setTasks(prev => [...prev, newTask]);
      }
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    // Optimistically update UI first
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));

    // Find the task to get the new completed state
    const task = tasks.find(t => t.id === id);
    if (task) {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) {
        console.error('Error toggling task:', error);
        // Revert on error
        setTasks(prev => prev.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
      }
    }
  }, [tasks]);

  const rescheduleTask = useCallback(async (id: string, newDate: Date, newTime?: string) => {
    // Optimistically update UI first
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, date: newDate, time: newTime } : task
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
          task.id === id ? { ...task, date: originalTask.date, time: originalTask.time } : task
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

  const value = useMemo(() => ({
    tasks,
    settings,
    addTask,
    toggleTask,
    rescheduleTask,
    updateSettings,
    confettiTrigger,
    triggerConfetti,
  }), [tasks, settings, confettiTrigger, addTask, toggleTask, rescheduleTask, updateSettings, triggerConfetti]);

  return (
    <AppContext.Provider value={value}>
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
