// src/contexts/AppContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { SettingsData } from '../components/Settings';
import { Task, TaskType } from '../types';

interface AppContextType {
  tasks: Task[];
  settings: SettingsData;
  addTask: (title: string, date: Date, type: TaskType) => void;
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

  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const addTask = (title: string, date: Date, type: TaskType) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      date,
      completed: false,
      type,
    };
    setTasks([...tasks, newTask]);
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

  const triggerConfetti = () => {
    setConfettiTrigger(prev => prev + 1);
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