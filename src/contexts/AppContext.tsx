// src/contexts/AppContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { SettingsData } from '../components/Settings';

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
    repeatDays?: Weekday[],
    intervalMonths?: number
  ): Date[] => {
    const scheduledDays: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

  const addTask = useCallback((title: string, date: Date, type: TaskType) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      date,
      completed: false,
      type,
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const rescheduleTask = useCallback((id: string, newDate: Date, newTime?: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, date: newDate, time: newTime } : task
    ));
  }, []);

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