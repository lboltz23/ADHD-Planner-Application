import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task, TaskType, CreateTaskParams, Weekday } from '../types';
import { SettingsData } from './Settings';
import { TaskCard } from './TaskCard';
import { TaskTypeSelector } from './TaskTypeSelector';
import AddTaskDialog from './AddTaskDialog';
import { Settings, Zap, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabaseClient';
// Dashboard Props
interface DashboardProps {
  onNavigateToCalendar: () => void;
  onNavigateToOneThingMode: () => void;
  onNavigateToSettings: () => void;
  tasks: Task[];
  onAddTask: (params: CreateTaskParams) => void;
  onToggleTask: (id: string) => void;
  onRescheduleTask: (id: string, newDate: Date) => void;
  settings: SettingsData;
  onTriggerConfetti?: () => void;
}

// Default user ID - replace with actual user ID when auth is implemented
const DEFAULT_USER_ID = '9dfa5616-322a-4287-a980-d33754320861';

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

  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (repeatDays && repeatDays.length > 0) {
    while (current <= end) {
      const dayOfWeek = DAY_NUMBER_TO_WEEKDAY[current.getDay()];
      if (repeatDays.includes(dayOfWeek)) {
        scheduledDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (intervalMonths) {
    while (current <= end) {
      scheduledDays.push(new Date(current));
      current.setMonth(current.getMonth() + intervalMonths);
    }
  } else {
    while (current <= end) {
      scheduledDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  return scheduledDays;
};

export function Dashboard({
  onNavigateToCalendar,
  onNavigateToOneThingMode,
  onNavigateToSettings,
  tasks,
  onAddTask,
  onToggleTask,
  onRescheduleTask,
  settings,
  onTriggerConfetti,
}: DashboardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedType, setSelectedType] = useState<TaskType>('basic');
  const [taskView, setTaskView] = useState<'today' | 'upcoming'>('today');
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  // Ref to track previous progress for confetti trigger
  const previousProgressRef = useRef(0);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all tasks for the user
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID);

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (data) {
        const allTasks: Task[] = [];

        // Process each row - handle recurring templates
        data.forEach((row: any) => {
          if (row.is_template && row.start_date && row.end_date) {
            // Generate instances from recurring template
            const startDate = new Date(row.start_date);
            const endDate = new Date(row.end_date);
            const daysSelected = row.days_selected as Weekday[] | undefined;
            const intervalMonths = row.recurrence_interval as number | undefined;
            const completedDates: string[] = row.completed_dates || [];

            const scheduledDays = generateScheduledDays(startDate, endDate, daysSelected, intervalMonths);

            scheduledDays.forEach((scheduledDate) => {
              const dateStr = scheduledDate.toISOString().split('T')[0];
              const isCompleted = completedDates.includes(dateStr);

              allTasks.push({
                id: `${row.id}_${dateStr}`,
                user_id: row.user_id,
                title: row.title,
                due_date: scheduledDate,
                completed: isCompleted,
                type: row.type as Task['type'],
                notes: row.notes,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
                is_template: false,
                parent_task_id: row.id,
                days_selected: daysSelected,
                recurrence_interval: intervalMonths,
                start_date: startDate,
                end_date: endDate,
              });
            });
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
              notes: row.notes,
              is_template: false,
            });
          }
        });

        // Filter for today's tasks
        const todayFiltered = allTasks.filter((task) => {
          const taskDate = new Date(task.due_date);
          return taskDate.toDateString() === today.toDateString();
        });

        // Filter for upcoming tasks (after today)
        const upcomingFiltered = allTasks
          .filter((task) => {
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate > today;
          })
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 5);

        setTodayTasks(todayFiltered);
        setUpcomingTasks(upcomingFiltered);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, []);

  // Fetch tasks on mount and when tasks prop changes (after add/toggle/reschedule)
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, tasks]);

  const handleAddTask = () => {
    if (newTaskTitle.trim() && !showAddTaskDialog) {
      setShowAddTaskDialog(true);
    }
  };

  const handleCreateTask = (params: CreateTaskParams) => {
    onAddTask(params);
    setNewTaskTitle('');  // Clear the input field
    setShowAddTaskDialog(false);
  };

  const handleCloseDialog = () => {
    setShowAddTaskDialog(false);
    // Don't clear newTaskTitle - let user keep it if they cancel
  };

  const handleProgressBar = () => {
    if (todayTasks.length === 0)
      return false;
    return true;
  }

// Calculate today's progress
  const completedTodayTasks = todayTasks.filter((task) => task.completed)
    .length;
  const todayProgress =
    todayTasks.length > 0
      ? (completedTodayTasks / todayTasks.length) * 100
      : 0;

  useEffect(() => {
    // Only trigger confetti if: all tasks are complete AND there's at least 1 task today
    if (
      todayProgress === 100 &&
      previousProgressRef.current < 100 &&
      todayTasks.length > 0 &&
      settings.confettiEnabled &&
      onTriggerConfetti
    ) {
      onTriggerConfetti();
    }
    previousProgressRef.current = todayProgress;
  }, [todayProgress, todayTasks.length, settings.confettiEnabled, onTriggerConfetti]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f6fb',
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#6b5b7f',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: '#9a8fbf',
    },
    headerRight: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    iconButton: {
      backgroundColor: '#f2ecfa',
      padding: 10,
      borderRadius: 8,
    },
    mainButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#b8a4d9',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      gap: 6,
    },
    mainButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    focusCard: {
      backgroundColor: settings.colorBlindMode ?  "#209ce5ff" : '#96d7efff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    focusCardText: {
      flex: 1,
    },
    focusTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
    },
    focusSubtitle: {
      fontSize: 13,
      color: '#f0faff',
    },
    progressCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    progressLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6b5b7f',
      marginBottom: 4,
    },
    progressSub: {
      fontSize: 13,
      color: '#8e7fb2',
      marginBottom: 12,
    },
    progressBarBackground: {
      backgroundColor: '#e0d7f5',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      backgroundColor: '#b8a4d9',
      height: '100%',
    },
    addTaskCard: {
      marginBottom: 20,
    },
    taskInputContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    taskInput: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5d9f2',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: '#473a44',
    },
    addButton: {
      backgroundColor: '#96d7efff',
      borderRadius: 6,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    typeSelector: {
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#6b5b7f',
      marginBottom: 12,
    },
    noTasksMessage: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: 14,
      paddingVertical: 16,
    },
    tasksList: {
      gap: 8,
    },
    addTaskBorder: {
      backgroundColor: '#ffffff',
      height: 125,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5d9f2',
      padding: 10,
      marginBottom: 15,
      paddingVertical: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>My Planner</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNavigateToSettings}
            >
              <Settings size={22} color="#b8a4d9" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={onNavigateToCalendar}
            >
              {/* Calendar Icon */}
              <Calendar size={18} color="#ffffff" />
              <Text style={styles.mainButtonText}>Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* One Thing Mode Card */}
        <TouchableOpacity
          style={styles.focusCard}
          onPress={onNavigateToOneThingMode}
          activeOpacity={0.8}
        >
          {/* Zap Icon */}
          <Zap size={26} color="#ffffff" />
          <View style={styles.focusCardText}>
            <Text style={styles.focusTitle}>One Thing Mode</Text>
            <Text style={styles.focusSubtitle}>
              Focus on a single task with a timer
            </Text>
          </View>
        </TouchableOpacity>

        {/* Progress Card */}
        {handleProgressBar() && (<View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <Text style={styles.progressSub}>
            {completedTodayTasks} of {todayTasks.length} tasks completed
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${todayProgress}%` },
              ]}
            />
          </View>
        </View>)}

        {/* Add Task Section */}
        <View style={styles.addTaskBorder}>
          <View style={styles.typeSelector}>
            <TaskTypeSelector
              selectedType={selectedType}
              onSelectType={setSelectedType}
              colorBlindMode={settings.colorBlindMode}
            />
          </View>

          <View style={styles.taskInputContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleAddTask}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTask}
              activeOpacity={0.9}
            >
              <Text style={{ fontSize: 24, color: '#ffffff' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
            
        {/* Task View Filter Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setTaskView('today')}
            style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: taskView === 'today' ? '#b8a4d9' : '#ffffff',
            borderWidth: 1,
            borderColor: '#e5d9f2',
            }}
          >
            <Text style={{ color: taskView === 'today' ? '#ffffff' : '#6b5b7f', fontWeight: '600' }}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTaskView('upcoming')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'upcoming' ? '#a8d8ea' : '#ffffff',
              borderWidth: 1,
              borderColor: '#e5d9f2',
            }}
          >
            <Text style={{ color: taskView === 'upcoming' ? '#ffffff' : '#6b5b7f', fontWeight: '600' }}>
              Upcoming
            </Text>
          </TouchableOpacity>
        </View>

        {taskView === 'today' ? (      
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No tasks for today</Text>
            ) : (
              <View style={styles.tasksList}>
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onReschedule={onRescheduleTask}
                    colorBlindMode={settings.colorBlindMode}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No upcoming tasks</Text>
            ) : (
              <View style={styles.tasksList}>
                {upcomingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onReschedule={onRescheduleTask}
                    colorBlindMode={settings.colorBlindMode}
                    showDate={true}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        <AddTaskDialog
          isOpen={showAddTaskDialog}
          onClose={handleCloseDialog}
          onAddTask={handleCreateTask}
          initialTaskType={selectedType}
          initialTitle={newTaskTitle}
          colorBlindMode={settings.colorBlindMode}
          tasks={tasks}
        />


      </ScrollView>
    </SafeAreaView>
  );
}
