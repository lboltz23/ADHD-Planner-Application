import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, 
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task, TaskType, CreateTaskParams, Weekday, combineAsDate } from '../types';
import { SettingsData } from './Settings';
import { TaskCard } from './TaskCard';
import AddTaskDialog from './AddTaskDialog';
import { TaskTypeSelector } from './TaskTypeSelector';
import { Calendar, Settings, Zap, Info, Plus, Minus } from 'lucide-react-native';
import { getFilterColor } from './taskColors';
import { getAppColors } from '../constants/theme';
import InfoPopup from './Info';
import { AppThemeColors, resolveThemePreference } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
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
  const systemScheme = useColorScheme();
  const resolvedTheme = resolveThemePreference(settings.theme, systemScheme);
  const colors = AppThemeColors[resolvedTheme];
  const isDark = resolvedTheme === 'dark';

  const [selectedType, setSelectedType] = useState<TaskType>('basic');
  const [taskView, setTaskView] = useState<'today' | 'upcoming' | 'repeating' | 'open'>('today');
  const [now, setNow] = useState(() => new Date());
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  // Ref to track previous progress for confetti trigger
  const previousProgressRef = useRef(0);
  const [showRoutine, setShowRoutine] = useState(true);
  // Refresh tasks when focused on page
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    },[])
  )

  useEffect(()=>{
    const interval = setInterval(() => {
      setNow(new Date());
    },60000);
    return () => clearInterval(interval)
    },[])


  useEffect(() => {
    if(!showAddTaskDialog){
      setNow(new Date()); // Refresh task lists when add task dialog is closed (after adding a task)
    }
  }, [showAddTaskDialog]);
  // Filter tasks from props for today
  const todayTasks = useMemo(() => {

    return tasks.filter((task) => {
      if (task.is_template) return false;

      const taskDate = new Date(task.due_date);
      const isToday = (
        taskDate.getFullYear() === now.getFullYear() &&
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getDate() === now.getDate()
      );
      if (!isToday) return false;

      // If a specific time is set and it has passed, it belongs in "open" instead
      if (task.time) {
        const taskDateTime = combineAsDate(task.due_date, task.time);
        return taskDateTime >= now;
      }
      return true;
    }).sort((a, b) => {
      const aTime = a.time ? combineAsDate(a.due_date, a.time).getTime() : new Date(a.due_date).setHours(0, 0, 0, 0);
      const bTime = b.time ? combineAsDate(b.due_date, b.time).getTime() : new Date(b.due_date).setHours(0, 0, 0, 0);
      return aTime - bTime;
    });
  }, [tasks, now,taskSearch]);

  // Filter tasks from props for upcoming (next 5 tasks after today)
  const upcomingTasks = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return tasks
      .filter((task) => {
        if (task.is_template) return false;
        if (!showRoutine && task.type == "routine"){
          return false;
        }
        if(!showRoutine && task.type == "long_interval"){
          return false;
        }
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today;
      })
      .sort((a, b) => new Date(combineAsDate(a.due_date,a.time || now)).getTime() -
                    new Date(combineAsDate(b.due_date,b.time || now)).getTime());
  }, [tasks, now, showRoutine, taskSearch]);

  const repeatingTasks = useMemo(() => {
    return tasks
    .filter((task) => task.is_template === true);
  }, [tasks,taskSearch]);

  const openTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (task.is_template || task.type === 'routine' || task.completed) return false;
        const taskDate = combineAsDate(task.due_date, task.time || new Date());
        return taskDate < now;
      })
      .sort((a, b) => new Date(combineAsDate(a.due_date,a.time || now)).getTime() -
                      new Date(combineAsDate(b.due_date,b.time || now)).getTime());
  }, [tasks, now,taskSearch]);
 
  const handleAddTask = () => {
    if (!showAddTaskDialog) {
      setShowAddTaskDialog(true);
    }
  };

  const handleCreateTask = (params: CreateTaskParams) => {
    onAddTask(params);
    setShowAddTaskDialog(false);
  };

  const handleCloseDialog = () => {
    setShowAddTaskDialog(false);
    // Don't clear newTaskTitle - let user keep it if they cancel
  };

  const handleProgressBar = () => {
    if (completedTodayTasks === 0)
      return false;
    return true;
  }

  const isEnabled = (checked: boolean) => {
    if(checked){
    setShowRoutine( previous => !previous)
    }
  }
  const [visibleToday, setVisibleToday] = useState(7);
  const [visibleUpcoming, setVisibleUpcoming] = useState(7);
  const [visibleOpen, setVisibleOpen] = useState(7);
  const [visibleRepeating, setVisibleRepeating] = useState(7);

  useEffect(() => {
    setVisibleToday(7);
    setVisibleUpcoming(7);
    setVisibleOpen(7);
    setVisibleRepeating(7);
  }, [taskView]);

  const handleLoadMore = (view: string) => {
    if (view === 'today') setVisibleToday(prev => prev + 7);
    else if (view === 'upcoming') setVisibleUpcoming(prev => prev + 7);
    else if (view === 'open') setVisibleOpen(prev => prev + 7);
    else if (view === 'repeating') setVisibleRepeating(prev => prev + 7);
  };

  const handleLoadLess = (view: string) => {
    if (view === 'today') setVisibleToday(7);
    else if (view === 'upcoming') setVisibleUpcoming(7);
    else if (view === 'open') setVisibleOpen(7);
    else if (view === 'repeating') setVisibleRepeating(7);
  };
// Calculate today's progress
  const completedTodayTasks = todayTasks.filter((task) => task.completed)
    .length;
  const todayProgress =
    todayTasks.length > 0
      ? (completedTodayTasks / todayTasks.length) * 100
      : 0;

  // Calculate streak count
    const [streakCount, setStreakCount] = useState<number>(0);

    const updateStreak = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // local midnight

      const lastLoginString = await AsyncStorage.getItem('lastLogin');
      const streakString = await AsyncStorage.getItem('streakCount');

      let streak = Number(streakString) || 0;

      if (!lastLoginString) {
        streak = 1;
      } else {
        const lastLogin = new Date(lastLoginString);
        lastLogin.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Same day → do nothing
          setStreakCount(streak);
          return;
        } else if (diffDays === 1) {
          streak += 1;
        } else {
          streak = 1; // missed day(s)
        }
      }

      await AsyncStorage.multiSet([
        ['streakCount', streak.toString()],
        ['lastLogin', today.toISOString()],
      ]);

      setStreakCount(streak);
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, []);
  
  useFocusEffect(
  useCallback(() => {
    updateStreak();
  }, [updateStreak])
  );

  useEffect(() => {
    const interval = setInterval(updateStreak, 60 * 60 * 1000); // every hour
    return () => clearInterval(interval);
  }, [updateStreak]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const justFinishedAll =
      todayProgress === 100 &&
      previousProgressRef.current < 100 &&
      todayTasks.length > 0 &&
      settings.confettiEnabled;

    if (justFinishedAll) {
      onTriggerConfetti?.();
    }

    previousProgressRef.current = todayProgress;
  }, [
    todayProgress,
    todayTasks.length,
    settings.confettiEnabled,
    onTriggerConfetti,
    isFocused
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.heading,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    headerRight: {
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-end',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    iconButton: {
      backgroundColor: settings.colorBlindMode ? "#EBEBEB":'#f2ecfa',
      padding: 10,
      borderRadius: 8,
    },
    mainButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.colorBlindMode ? '#EE3377' : '#b8a4d9',
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
      backgroundColor: settings.colorBlindMode
        ? '#209ce5ff'
        : (isDark ? '#2d4b5f' : '#96d7efff'),
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
      color: isDark ? '#d6ebf4' : '#f0faff',
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: getAppColors(settings.colorBlindMode, isDark).border,
    },
    progressLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: settings.colorBlindMode ? '#d6d6d6' : '#6b5b7f',
      marginBottom: 4,
    },
    progressSub: {
      fontSize: 13,
      color: settings.colorBlindMode ? '#dbd8d8' :'#8e7fb2',
      marginBottom: 12,
    },
    progressBarBackground: {
      backgroundColor: settings.colorBlindMode ? '#88CCEE' : '#e0d7f5',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      backgroundColor: settings.colorBlindMode ? '#33BBEE' : '#b8a4d9',
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
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: getAppColors(settings.colorBlindMode, isDark).border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.text,
    },
    addButton: {
      backgroundColor: settings.colorBlindMode
        ? '#209ce5ff' : colors.accentSoft,
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
      color: getAppColors(settings.colorBlindMode, isDark).primary,
      marginBottom: 12,
    },
    noTasksMessage: {
      textAlign: 'center',
      color: getAppColors(settings.colorBlindMode, isDark).placeholder,
      fontSize: 14,
      paddingVertical: 16,
    },
    tasksList: {
      gap: 8,
    },
    addTaskBorder: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: getAppColors(settings.colorBlindMode, isDark).border,
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
      backgroundColor: isDark ? '#5d4a34' : '#ffe5cc',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50,
      alignSelf: 'flex-end',
    },
    streakBadgeText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#ffd089' : '#ff9500',
    },
    streakBadgeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#ffd089' : '#ff9500',
    },
    seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#45a9f6' : colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  seeMoreText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  seeLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#45a9f6' : colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  seeLessText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  filterText: {
    color: getAppColors(settings.colorBlindMode, isDark).primary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: getAppColors(settings.colorBlindMode, isDark).border,
  },
      inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      padding: 0,
      backgroundColor: "transparent",
    },
  });

  return (
    <SafeAreaView style={[styles.container]}>
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
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowInfo(true)}
              >
                <Info size={22} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onNavigateToSettings}
              >
                <Settings size={22} color={colors.accent} />
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
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{streakCount}</Text>
              <Text style={styles.streakBadgeLabel}>{streakCount === 1 ? 'day' : 'days'}</Text>
            </View>
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTask}
              activeOpacity={0.9}
            >
              <Text style={{ fontSize:30,color: '#ffffff' }}>+</Text>
            </TouchableOpacity>
          </View>
        
                {/* Task Search */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Search tasks..."
            placeholderTextColor={getAppColors(settings.colorBlindMode, isDark).placeholder}
            value={taskSearch}
            onChangeText={setTaskSearch}
          />
        </View>
        {/* Task View Filter Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setTaskView('open')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'open' ? getFilterColor('open', settings.colorBlindMode) : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: taskView === 'open' ? '#ffffff' : colors.heading, fontWeight: '600' }}>
              Open
            </Text>
          </TouchableOpacity>
        
          <TouchableOpacity
            onPress={() => setTaskView('today')}
            style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: taskView === 'today' ? getFilterColor('today', settings.colorBlindMode) : colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            }}
          >
            <Text style={{ color: taskView === 'today' ? '#ffffff' : colors.heading, fontWeight: '600' }}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTaskView('upcoming')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'upcoming' ? getFilterColor('upcoming', settings.colorBlindMode) : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: taskView === 'upcoming' ? '#ffffff' : colors.heading, fontWeight: '600' }}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTaskView('repeating')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: taskView === 'repeating' ? getFilterColor('repeating', settings.colorBlindMode) : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: taskView === 'repeating' ? '#ffffff' : colors.heading, fontWeight: '600' }}>
              Repeating
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{paddingBottom: 300}}>
        {taskView === 'today' ? (
          <View style={[styles.section]}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No tasks for today</Text>
            ) : (
              <View style={[styles.tasksList,{paddingBottom: 80}]}>
                {todayTasks.filter((task) => task.title.toLowerCase().includes(taskSearch.toLowerCase()))
                .slice(0, visibleToday).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                    showTime={true}
                  />
                ))}
                {todayTasks.length > visibleToday && (
                  <TouchableOpacity style={styles.seeMoreButton} onPress={() => handleLoadMore('today')}>
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.seeMoreText}>Show More Tasks</Text>
                  </TouchableOpacity>
                )}
                {visibleToday > 7 && todayTasks.length <= visibleToday && (
                  <TouchableOpacity style={styles.seeLessButton} onPress={() => handleLoadLess('today')}>
                    <Minus size={20} color="#ffffff" />
                    <Text style={styles.seeLessText}>Show Less Tasks</Text>
                  </TouchableOpacity>
                )}

              </View>
            )}
          </View>
        ) : taskView === 'upcoming' ? (
          <View style={styles.section}>
            <View style={styles.filterRow}>
            <Text style={styles.filterText}> Show Repeating Tasks </Text>
            <Switch
                value={showRoutine}
                onValueChange={(checked) =>
                    setShowRoutine(checked)
                  }
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"           
            />
            </View>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingTasks.length === 0 ? (
              <Text style={styles.noTasksMessage}>No upcoming tasks</Text>
            ) : (
              <View style={styles.tasksList}>
                {upcomingTasks.filter((task) => task.title.toLowerCase().includes(taskSearch.toLowerCase()))
                .slice(0, visibleUpcoming).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                    showDate={true}
                    showTime={true}
                  />
                ))}
                {upcomingTasks.length > visibleUpcoming && (
                  <TouchableOpacity style={styles.seeMoreButton} onPress={() => handleLoadMore('upcoming')}>
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.seeMoreText}>Show More Tasks</Text>
                  </TouchableOpacity>
                )}
                {visibleUpcoming > 7 && upcomingTasks.length <= visibleUpcoming && (
                  <TouchableOpacity style={styles.seeLessButton} onPress={() => handleLoadLess('upcoming')}>
                    <Minus size={20} color="#ffffff" />
                    <Text style={styles.seeLessText}>Show Less Tasks</Text>
                  </TouchableOpacity>
                )}
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
                {openTasks.filter((task) => task.title.toLowerCase().includes(taskSearch.toLowerCase()))
                .slice(0, visibleOpen).map((task) => (
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
                {openTasks.length > visibleOpen && (
                  <TouchableOpacity style={styles.seeMoreButton} onPress={() => handleLoadMore('open')}>
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.seeMoreText}>Show More Tasks</Text>
                  </TouchableOpacity>
                )}
                {visibleOpen > 7 && openTasks.length <= visibleOpen && (
                  <TouchableOpacity style={styles.seeLessButton} onPress={() => handleLoadLess('open')}>
                    <Minus size={20} color="#ffffff" />
                    <Text style={styles.seeLessText}>Show Less Tasks</Text>
                  </TouchableOpacity>
                )}
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
                {repeatingTasks.filter((task) => task.title.toLowerCase().includes(taskSearch.toLowerCase()))
                .slice(0, visibleRepeating).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onUpdate={onEditTask}
                    onDelete={onDeleteTask}
                    colorBlindMode={settings.colorBlindMode}
                    isDarkMode={isDark}
                    showDate={true}
                  />
                ))}
                {repeatingTasks.length > visibleRepeating && (
                  <TouchableOpacity style={styles.seeMoreButton} onPress={() => handleLoadMore('repeating')}>
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.seeMoreText}>Show More Tasks</Text>
                  </TouchableOpacity>
                )}
                {visibleRepeating > 7 && repeatingTasks.length <= visibleRepeating && (
                  <TouchableOpacity style={styles.seeLessButton} onPress={() => handleLoadLess('repeating')}>
                    <Minus size={20} color="#ffffff" />
                    <Text style={styles.seeLessText}>Show Less Tasks</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        </View>
        <InfoPopup
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
          colorBlindMode={settings.colorBlindMode}
          isDarkMode={isDark}
        />
        <AddTaskDialog
          isOpen={showAddTaskDialog}
          onClose={handleCloseDialog}
          onAddTask={handleCreateTask}
          initialTaskType={selectedType}
          colorBlindMode={settings.colorBlindMode}
          tasks={tasks}
          isDarkMode={isDark}
        />


      </ScrollView>
    </SafeAreaView>
  );
}
