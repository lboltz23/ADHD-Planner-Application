// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Task, CreateTaskParams, Weekday, UpdateTaskParams } from '../types';
import { SettingsData } from '../components/Settings';
import { supabase } from '@/lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Session, User } from "@supabase/supabase-js";

/* ----------------------------- Day Mapping ----------------------------- */

const DAY_NUMBER_TO_WEEKDAY: Record<number, Weekday> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

/* ----------------------------- Types ----------------------------- */

interface AppContextType {
  tasks: Task[];
  settings: SettingsData;
  addTask: (params: CreateTaskParams) => void;
  toggleTask: (id: string) => void;
  updateTask: (
    id: string,
    fields: { title?: string; due_date?: Date; notes?: string }
  ) => void;
  deleteTask: (id: string) => void;
  updateSettings: (newSettings: SettingsData) => void;
  streakCount: number;
  login: () => void;
  confettiTrigger: number;
  triggerConfetti: () => void;
}

// await supabase.auth.signInWithPassword({
//   email: "test@test.com",
//   password: "password123",
// });

// const DEFAULT_USER_ID = '9dfa5616-322a-4287-a980-d33754320861';

const AppContext = createContext<AppContextType | undefined>(undefined);

/* ====================================================================== */
/*                               PROVIDER                                 */
/* ====================================================================== */

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

  const [streakCount, setStreakCount] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState<Date | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  /* ===================== AUTH SESSION HANDLING ===================== */

useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setCurrentUser(session?.user ?? null);
  });

  // Listen for auth changes
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  /* ====================================================================== */
  /*                          LOAD TASKS (User Scoped)                      */
  /* ====================================================================== */

  useEffect(() => {
    if (!currentUser) return;

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Load tasks error:", error);
        return;
      }

      if (!data) return;

      const formatted: Task[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        user_id: row.user_id,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        due_date: new Date(row.due_date),
        completed: row.completed || false,
        type: row.type,
        notes: row.notes,
        is_template: row.is_template,
        parent_task_id: row.parent_task_id,
        days_selected: row.days_selected,
        recurrence_interval: row.recurrence_interval,
        start_date: row.start_date ? new Date(row.start_date) : undefined,
        end_date: row.end_date ? new Date(row.end_date) : undefined,
      }));

      setTasks(formatted);
    };

    loadTasks();
  }, [currentUser]);

  /* ====================================================================== */
  /*                               ADD TASK                                 */
  /* ====================================================================== */

  const addTask = useCallback(
    async (params: CreateTaskParams) => {
      if (!currentUser) return;

      const id = uuidv4();
      const now = new Date();

      const newTask: Task = {
        id,
        user_id: currentUser.id,
        title: params.title,
        due_date: params.due_date,
        completed: false,
        type: params.type,
        notes: params.notes,
        created_at: now,
        updated_at: now,
        is_template: false,
        parent_task_id:
          params.type === "related" ? params.parent_task_id : undefined,
      };

      const { error } = await supabase.from("tasks").insert({
        id,
        user_id: currentUser.id,
        title: newTask.title,
        due_date: newTask.due_date.toISOString(),
        completed: false,
        type: newTask.type,
        notes: newTask.notes,
        is_template: false,
        parent_task_id: newTask.parent_task_id,
      });

      if (error) {
        console.error("Insert error:", error);
        return;
      }

      setTasks((prev) => [...prev, newTask]);
    },
    [currentUser]
  );

  /* ====================================================================== */
  /*                             TOGGLE TASK                                */
  /* ====================================================================== */

  const toggleTask = useCallback(
    async (id: string) => {
      if (!currentUser) return;

      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updated = !task.completed;

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: updated } : t))
      );

      const { error } = await supabase
        .from("tasks")
        .update({ completed: updated })
        .eq("id", id)
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Toggle error:", error);
      }
    },
    [tasks, currentUser]
  );

  /* ====================================================================== */
  /*                             UPDATE TASK                                */
  /* ====================================================================== */

  const updateTask = useCallback(
    async (
      id: string,
      fields: { title?: string; due_date?: Date; notes?: string }
    ) => {
      if (!currentUser) return;

      const payload: Record<string, any> = {};
      if (fields.title) payload.title = fields.title;
      if (fields.due_date)
        payload.due_date = fields.due_date.toISOString();
      if (fields.notes !== undefined)
        payload.notes = fields.notes;

      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)
        .eq("user_id", currentUser.id);

      if (!error) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
        );
      } else {
        console.error("Update error:", error);
      }
    },
    [currentUser]
  );

  /* ====================================================================== */
  /*                             DELETE TASK                                */
  /* ====================================================================== */

  const deleteTask = useCallback(
    async (id: string) => {
      if (!currentUser) return;

      setTasks((prev) => prev.filter((t) => t.id !== id));

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Delete error:", error);
      }
    },
    [currentUser]
  );

  /* ====================================================================== */
  /*                            STREAK LOGIC                                */
  /* ====================================================================== */

  const updateStreak = () => {
    const today = new Date();

    if (lastLoginDate) {
      const diff =
        (today.getTime() - lastLoginDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (Math.floor(diff) === 1) setStreakCount((s) => s + 1);
      else if (diff > 1) setStreakCount(1);
    } else {
      setStreakCount(1);
    }

    setLastLoginDate(today);
  };

  const login = () => {
    updateStreak();
  };

  const updateSettings = useCallback(
    (newSettings: SettingsData) => {
      setSettings(newSettings);
    },
    []
  );

  const triggerConfetti = useCallback(() => {
    setConfettiTrigger((prev) => prev + 1);
  }, []);

  /* ====================================================================== */

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
