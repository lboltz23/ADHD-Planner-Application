import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Settings } from 'lucide-react-native';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { Task, TaskType, CreateTaskParams } from '../types';
import { SettingsData } from './Settings';
import { ProgressCircle } from './ProgressCircle';

interface WeeklyViewProps {
  tasks: Task[];
  onAddTask: (params: CreateTaskParams) => void;
  onToggleTask: (id: string) => void;
  onRescheduleTask: (id: string, newDate: Date) => void;
  colorBlindMode?: boolean;
  onNavigateBack: () => void;
  onNavigateSettings: () => void;
}

export function WeeklyView({ tasks, onToggleTask, onRescheduleTask, colorBlindMode, onNavigateBack, onNavigateSettings }: WeeklyViewProps) {
  const screenWidth = Dimensions.get('window').width;

  const weekDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, []);

  const tasksByDate = useMemo(() => {
    const map: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const key = task.date.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  // Group dates into pages of 3
  const pages = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < weekDates.length; i += 3) {
      result.push(weekDates.slice(i, i + 3));
    }
    return result;
  }, [weekDates]);

  const todayTasks = tasks.filter((task) => {
    const today = new Date();
    const taskDate = new Date(task.date);
    return taskDate.toDateString() === today.toDateString();
  });
  const completedTodayTasks = todayTasks.filter((task) => task.completed)
    .length;
  const todayProgress =
    todayTasks.length > 0
      ? (completedTodayTasks / todayTasks.length) * 100
      : 0;
  
  const handleProgressCircle = () => {
    if (todayTasks.length === 0)
      return false;
    return true;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f6f3fb" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#6b5b7f" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Weekly Tasks</Text>
        <TouchableOpacity onPress={onNavigateSettings} style={styles.settingsButton}>
          <Settings size={22} color="#b8a4d9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        style={styles.weekContainer}
      >
        {pages.map((pageDates, pageIndex) => (
          <ScrollView
            key={pageIndex}
            style={{ width: screenWidth }}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            {pageDates.map(date => {
              const dateStr = date.toDateString();
              const dayTasks = tasksByDate[dateStr] || [];
              return (
                <View key={dateStr} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Text>
                  {dayTasks.length === 0 ? (
                    <Text style={styles.noTasks}>No tasks</Text>
                  ) : (
                    dayTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onReschedule={onRescheduleTask}
                        colorBlindMode={!!colorBlindMode}
                      />
                    ))
                  )}
                </View>
              );
            })}
          </ScrollView>
        ))}
      </ScrollView>
      {handleProgressCircle() && (
        <ProgressCircle 
        percentage={todayProgress} 
        size={100} 
        strokeWidth={10} 
        label="Daily Progress" 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b5b7f',
    flex: 1,
    marginLeft: 4,
  },
  settingsButton: {
    backgroundColor: '#f2ecfa',
    padding: 10,
    borderRadius: 8,
  },
  weekContainer: {
    flex: 1,
  },
  pageContent: {
    padding: 16,
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5d9f2',
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#6b5b7f',
  },
  noTasks: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    paddingVertical: 8,
  },
});