// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Task, CreateTaskParams, Weekday } from '../types';
import { SettingsData } from '../components/Settings';
import { supabase } from '@/lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DAY_NUMBER_TO_WEEKDAY: Record<number, Weekday> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

interface AppContextType {
  tasks: Task[];
  settings: SettingsData;
  loadingTasks: boolean;
  tasksError: string | null;
  addTask: (params: CreateTaskParams) => void;
  toggleTask: (id: string) => void;
  rescheduleTask: (id: string, newDate: Date, newTime?: string) => void;
  updateTask: (id: string, newTitle: string, newDate: Date) => void;
  deleteTask: (id: string) => void;
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
    theme: 'auto',
    defaultTaskView: 'all',
    colorBlindMode: false,
  });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Load tasks on mount (with dev login)
  useEffect(() => {
    const initialize = async () => {
      setLoadingTasks(true);
      setTasksError(null);

    // DEV LOGIN (remove later)
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: 'test@adhdplanner.com',
        password: 'test1234',
      });

    if (loginError) {
      console.log('Dev login error:', loginError.message);
      setTasksError('Login failed.');
      setLoadingTasks(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setTasksError('Failed to get user.');
      setLoadingTasks(false);
      return;
    }

    // Ensure profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    if (!profileData) {
      await supabase.from('profiles').insert({
        id: user.id,
      });
    } else {
      // Load settings from profile
      setSettings({
        theme: profileData.theme ?? 'auto',
        defaultTimerMinutes: profileData.default_timer_minutes ?? 25,
        soundEnabled: profileData.sound_enabled ?? true,
        confettiEnabled: profileData.confetti_enabled ?? true,
        defaultTaskView: profileData.default_task_view ?? 'all',
        colorBlindMode: profileData.color_blind_mode ?? false,
      });
    }

    // Load tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
      setTasksError('Failed to load tasks.');
    } else if (tasksData) {
      const loadedTasks: Task[] = tasksData.map((row: any) => ({
        id: row.id,
        title: row.title,
        date: new Date(row.due_date),
        completed: row.completed ?? false,
        type: row.type,
        notes: row.description,
      }));

      setTasks(loadedTasks);
    }

    setLoadingTasks(false);
  };

  initialize();
}, []);


  // Add Task
  const addTask = useCallback(async (params: CreateTaskParams) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTask: Task = {
      id: uuidv4(),
      title: params.title,
      date: params.date,
      completed: false,
      type: params.type,
      notes: params.notes,
    };

    const { error } = await supabase.from('tasks').insert({
      id: newTask.id,
      title: newTask.title,
      due_date: newTask.date.toISOString(),
      completed: false,
      type: newTask.type,
      description: newTask.notes,
      user_id: user.id,
      is_template: false,
    });


    if (error) {
      console.error('Error inserting task:', error);
      return;
    }

    setTasks(prev => [newTask, ...prev]);
  }, []);

  // Toggle Task
  const toggleTask = useCallback(async (id: string) => {
  setTasks(prev => {
    const updated = prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    const toggledTask = prev.find(t => t.id === id);
    if (toggledTask) {
      supabase
        .from('tasks')
        .update({ completed: !toggledTask.completed })
        .eq('id', id);
    }

    return updated;
  });
}, []);

  //  Reschedule
  const rescheduleTask = useCallback(async (
    id: string,
    newDate: Date
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, date: newDate }
          : task
      )
    );

    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDate.toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Reschedule error:', error);
    }

  }, []);

  //  Update Task
  const updateTask = useCallback(async (
    id: string,
    newTitle: string,
    newDate: Date
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: newTitle,
        due_date: newDate.toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Update task error:', error);
    }


    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, title: newTitle, date: newDate }
          : task
      )
    );
  }, []);

  //  Delete Task
  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
    }


    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

    const updateSettings = useCallback(async (newSettings: SettingsData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      theme: newSettings.theme,
      default_timer_minutes: newSettings.defaultTimerMinutes,
      sound_enabled: newSettings.soundEnabled,
      confetti_enabled: newSettings.confettiEnabled,
      default_task_view: newSettings.defaultTaskView,
      color_blind_mode: newSettings.colorBlindMode,
    });

    if (error) {
      console.error('Error saving settings:', error);
      return;
    }

    setSettings(newSettings);
  }, []);


  const triggerConfetti = useCallback(() => {
    setConfettiTrigger(prev => prev + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        settings,
        loadingTasks,
        tasksError,
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
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}