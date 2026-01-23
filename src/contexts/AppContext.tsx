// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task, CreateTaskParams } from '../types';
import { SettingsData } from '../components/Settings';

interface AppContextType {
  tasks: Task[];
  settings: SettingsData;
  addTask: (params: CreateTaskParams) => void;
  toggleTask: (id: string) => void;
  rescheduleTask: (id: string, newDate: Date, newTime?: string) => void;
  updateSettings: (newSettings: SettingsData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      date: new Date(),
      completed: false,
      type: "basic",
    },
    {
      id: "2",
      title: "Team meeting at 2 PM",
      date: new Date(),
      completed: false,
      type: "routine",
    },
    {
      id: "3",
      title: "Review code changes",
      date: new Date(Date.now() + 86400000), // Tomorrow
      completed: false,
      type: "related",
    },
    {
      id: "4",
      title: "Prepare presentation",
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      completed: false,
      type: "basic",
    },
    {
      id: "5",
      title: "Organize workspace",
      date: new Date(Date.now() + 259200000), // In three days
      completed: false,
      type: "long_interval",
    },
  ]);

  const [settings, setSettings] = useState<SettingsData>({
    defaultTimerMinutes: 25,
    soundEnabled: true,
    confettiEnabled: true,
    theme: "auto",
    defaultTaskView: "all",
    colorBlindMode: false,
  });

  // Helper function to generate scheduled days for recurring tasks
  const generateScheduledDays = (
    startDate: Date,
    endDate: Date,
    frequency?: "daily" | "weekly" | "monthly",
    intervalDays?: number
  ): Date[] => {
    const scheduledDays: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    // Set times to midnight for consistent comparison
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      scheduledDays.push(new Date(current));

      // Increment based on frequency or interval
      if (frequency === "daily") {
        current.setDate(current.getDate() + 1);
      } else if (frequency === "weekly") {
        current.setDate(current.getDate() + 7);
      } else if (frequency === "monthly") {
        current.setMonth(current.getMonth() + 1);
      } else if (intervalDays) {
        current.setDate(current.getDate() + intervalDays);
      } else {
        // Default to daily if no frequency specified
        current.setDate(current.getDate() + 1);
      }
    }

    return scheduledDays;
  };

  const addTask = (params: CreateTaskParams) => {
    const { title, date, type, repeatFrequency, intervalDays, notes, startDate, endDate } = params;
    const baseId = Date.now().toString();

    // Check if this is a recurring task
    if ((type === "routine" || type === "long_interval") && startDate && endDate) {
      // Generate scheduled days
      const scheduledDays = generateScheduledDays(
        startDate,
        endDate,
        repeatFrequency,
        intervalDays
      );

      // Create individual task instances for each scheduled day
      const recurringTasks: Task[] = scheduledDays.map((scheduledDate, index) => ({
        id: `${baseId}-instance-${index}`,
        title,
        date: scheduledDate,
        completed: false,
        type,
        notes,
        repeatFrequency,
        intervalDays,
        startDate,
        endDate,
        scheduledDays,
        isRecurring: true,
        recurringTaskId: baseId,
        instanceDate: scheduledDate,
      }));

      setTasks([...tasks, ...recurringTasks]);
    } else {
      // Regular non-recurring task
      const newTask: Task = {
        id: baseId,
        title,
        date,
        completed: false,
        type,
        notes,
      };
      setTasks([...tasks, newTask]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const rescheduleTask = (id: string, newDate: Date, newTime?: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, date: newDate, time: newTime } : task
    ));
  };

  const updateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        settings,
        addTask,
        toggleTask,
        rescheduleTask,
        updateSettings,
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