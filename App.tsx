import React, { useState } from "react";
import { StyleSheet, View } from 'react-native';
import { Dashboard } from "./components/Dashboard";
import { CalendarView } from "./components/CalendarView";
import { OneThingMode } from "./components/OneThingMode";
import { Settings, SettingsData } from "./components/Settings";

export type TaskType = "routine" | "basic" | "related";

export interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  type: TaskType;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "calendar" | "onething" | "settings">("dashboard");
  const [settings, setSettings] = useState<SettingsData>({
    defaultTimerMinutes: 25,
    soundEnabled: true,
    confettiEnabled: true,
    theme: "auto",
    defaultTaskView: "all",
    colorBlindMode: false,
  });
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
  ]);

  const handleAddTask = (title: string, date: Date, type: TaskType) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      date,
      completed: false,
      type,
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <View style={styles.container}>
      {currentScreen === "dashboard" ? (
        <Dashboard
          onNavigateToCalendar={() => setCurrentScreen("calendar")}
          onNavigateToOneThingMode={() => setCurrentScreen("onething")}
          onNavigateToSettings={() => setCurrentScreen("settings")}
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          settings={settings}
        />
      ) : currentScreen === "calendar" ? (
        <CalendarView
          onNavigateBack={() => setCurrentScreen("dashboard")}
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          settings={settings}
        />
      ) : currentScreen === "onething" ? (
        <OneThingMode
          onNavigateBack={() => setCurrentScreen("dashboard")}
          tasks={tasks}
          onToggleTask={handleToggleTask}
          settings={settings}
        />
      ) : (
        <Settings
          onNavigateBack={() => setCurrentScreen("dashboard")}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
