import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import AddTaskDialog from './AddTaskDialog';
import { TaskTypeSelector } from './TaskTypeSelector';
import { Calendar, Settings, Zap } from 'lucide-react-native';
import { getFilterColor } from './taskColors';

// Dashboard Props
interface DashboardProps {
  onNavigateToCalendar: () => void;
  onNavigateToOneThingMode: () => void;
  onNavigateToSettings: () => void;
  tasks: Task[];
  onAddTask: (params: CreateTaskParams) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, fields: { title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
  onDeleteTask: (id: string) => void;
  settings: SettingsData;
  onTriggerConfetti?: () => void;
}

export function Dashboard({
  onNavigateToCalendar,
  onNavigateToOneThingMode,
  onNavigateToSettings,
  tasks,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  settings,
  onTriggerConfetti,
}: DashboardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedType, setSelectedType] = useState<TaskType>('basic');
  const [taskView, setTaskView] = useState<'today' | 'upcoming' | 'repeating' | 'open'>('today');
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  // Ref to track previous progress for confetti trigger
  const previousProgressRef = useRef(0);

  // Filter tasks from props for today
  const todayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => {
      if (task.is_template) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === today.toDateString();
    });
  }, [tasks]);

  // Filter tasks from props for upcoming (next 5 tasks after today)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks
      .filter((task) => {
        if (task.is_template) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  }, [tasks]);

  const repeatingTasks = useMemo(() => {
    return tasks.filter((task) => task.is_template === true);
  }, [tasks]);

  const openTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks
      .filter((task) => {
        if (task.is_template || task.type === 'routine' ||  task.type === 'long_interval') return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today;
      })
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
      .slice(0, 7);
  }, [tasks]);
 
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

  // Calculate streak count
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const calculateStreak = () => {
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      while (streak < 30) {
        const dateString = currentDate.toDateString();
        const tasksForDate = tasks.filter((task) => {
          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.toDateString() === dateString && task.completed;
        });

        if (tasksForDate.length > 0) {
          streak++;
        } else {
          break;
        }

        currentDate.setDate(currentDate.getDate() - 1);
      }

      setStreakCount(streak);
    };

    calculateStreak();
  }, [tasks]);

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
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5d9f2',
      padding: 10,
      marginBottom: 20,
    },
    streakContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#e5d9f2',
      alignItems: 'center',
    },
    streakText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6b5b7f',
    },
    streakBadge: {
      backgroundColor: '#ffe5cc',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50,
    },
    streakBadgeText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ff9500',
    },
    streakBadgeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#ff9500',
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
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{streakCount}</Text>
              <Text style={styles.streakBadgeLabel}>day</Text>
            </View>
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

        {/* Streak Counter */}

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
            onPress={() => setTaskView('open')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'open' ? getFilterColor('open', settings.colorBlindMode) : '#ffffff',
              borderWidth: 1,
              borderColor: '#e5d9f2',
            }}
          >
            <Text style={{ color: taskView === 'open' ? '#ffffff' : '#6b5b7f', fontWeight: '600' }}>
              Open
            </Text>
          </TouchableOpacity>
        
          <TouchableOpacity
            onPress={() => setTaskView('today')}
            style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: taskView === 'today' ? getFilterColor('today', settings.colorBlindMode) : '#ffffff',
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
              backgroundColor: taskView === 'upcoming' ? getFilterColor('upcoming', settings.colorBlindMode) : '#ffffff',
              borderWidth: 1,
              borderColor: '#e5d9f2',
            }}
          >
            <Text style={{ color: taskView === 'upcoming' ? '#ffffff' : '#6b5b7f', fontWeight: '600' }}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTaskView('repeating')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'repeating' ? getFilterColor('repeating', settings.colorBlindMode) : '#ffffff',
              borderWidth: 1,
              borderColor: '#e5d9f2',
            }}
          >
            <Text style={{ color: taskView === 'repeating' ? '#ffffff' : '#6b5b7f', fontWeight: '600' }}>
              Repeating
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
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                  />
                ))}
              </View>
            )}
          </View>
        ) : taskView === 'upcoming' ? (
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
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                    showDate={true}
                  />
                ))}
              </View>
            )}
          </View>
        ) : taskView === 'open' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open</Text>
            {openTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No open tasks</Text>
            ) : (
              <View style={styles.tasksList}>
                {openTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeating</Text>
            {repeatingTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No repeating tasks</Text>
            ) : (
              <View style={styles.tasksList}>
                {repeatingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
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
