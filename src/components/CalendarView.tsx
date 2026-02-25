import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Settings, ChevronDown, Plus } from 'lucide-react-native';
import { TaskCard } from './TaskCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task, Weekday } from '../types';
import { SettingsData } from './Settings';
import { ProgressCircle } from './ProgressCircle';
import { AppThemeColors, resolveThemePreference, ThemeColors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useApp } from '../contexts/AppContext'; 

interface WeeklyViewProps {
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, fields: { title?: string; due_date?: Date; notes?: string; parent_id?: string; start_date?: Date; end_date?: Date; recurrence_interval?: number; days_selected?: Weekday[] }) => void;
  onDeleteTask: (id: string) => void;
  colorBlindMode?: boolean;
  onNavigateBack: () => void;
  onNavigateSettings: () => void;
  settings: SettingsData;
  onTriggerConfetti?: () => void;
}

export function WeeklyView({ onToggleTask, onEditTask, onDeleteTask, colorBlindMode, onNavigateBack, onNavigateSettings, settings }: WeeklyViewProps) {
  const systemScheme = useColorScheme();
  const resolvedTheme = resolveThemePreference(settings.theme, systemScheme);
  const colors = AppThemeColors[resolvedTheme];
  const isDark = resolvedTheme === 'dark';
  const styles = useMemo(() => getStyles(colors), [colors]);

  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef<ScrollView>(null);

  // State for month selection and visible days
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [daysToShow, setDaysToShow] = useState(7);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);


  const { tasks } = useApp();

  // Derive monthTasks from global tasks state (same pattern as Dashboard)
  const monthTasks = useMemo(() => {
    const monthStart = new Date(selectedMonth.year, selectedMonth.month, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    return tasks.filter(task => {
      if (task.is_template) return false;
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
  }, [tasks, selectedMonth.year, selectedMonth.month]);
  
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators();
    }, 500);
    }, []);
  
  const tasksByDate = useMemo(() => {
    const map: { [key: string]: Task[] } = {};
    monthTasks.forEach(task => {
      const key = new Date(task.due_date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [monthTasks]);
  

  // Generate list of months (current month + next 11 months)
  const availableMonths = useMemo(() => {
    const months: { year: number; month: number; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }
    return months;
  }, []);

  // Generate dates based on selected month and days to show
  const weekDates = useMemo(() => {
    const today = new Date();
    const isCurrentMonth = selectedMonth.year === today.getFullYear() && selectedMonth.month === today.getMonth();

    // If current month, start from today; otherwise start from 1st of month
    const startDate = isCurrentMonth
      ? new Date(today)
      : new Date(selectedMonth.year, selectedMonth.month, 1);

    // Calculate days remaining in month
    const lastDayOfMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    const startDay = startDate.getDate();
    const daysInMonthRemaining = lastDayOfMonth - startDay + 1;
    const actualDaysToShow = Math.min(daysToShow, daysInMonthRemaining);

    return Array.from({ length: actualDaysToShow }).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  }, [selectedMonth, daysToShow]);

  // Check if there are more days to show in the month
  const hasMoreDays = useMemo(() => {
    const lastDayOfMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = selectedMonth.year === today.getFullYear() && selectedMonth.month === today.getMonth();
    const startDay = isCurrentMonth ? today.getDate() : 1;
    const daysInMonthRemaining = lastDayOfMonth - startDay + 1;
    return daysToShow < daysInMonthRemaining;
  }, [selectedMonth, daysToShow]);

  // Group dates into pages of 3
  const pages = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < weekDates.length; i += 3) {
      result.push(weekDates.slice(i, i + 3));
    }
    return result;
  }, [weekDates]);

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedMonth({ year, month });
    setDaysToShow(7); // Reset to 7 days when changing month
    setShowMonthDropdown(false);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  };

  const handleLoadMore = () => {
    setDaysToShow(prev => prev + 7);
  };

  const todayTasks = monthTasks.filter((task) => {
    if (task.is_template) return false;
    const today = new Date();
    const taskDate = new Date(task.due_date);
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
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.heading} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Weekly Tasks</Text>
        <TouchableOpacity onPress={onNavigateSettings} style={styles.settingsButton}>
          <Settings size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Month Selector Dropdown */}
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setShowMonthDropdown(!showMonthDropdown)}
        >
          <Text style={styles.monthSelectorText}>
            {new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <ChevronDown size={20} color={colors.heading} />
        </TouchableOpacity>
      </View>

      {/* Month Dropdown */}
      {showMonthDropdown && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {availableMonths.map((m, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedMonth.year === m.year && selectedMonth.month === m.month && styles.dropdownItemSelected
                ]}
                onPress={() => handleMonthSelect(m.year, m.month)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedMonth.year === m.year && selectedMonth.month === m.month && styles.dropdownItemTextSelected
                ]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
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
                        tasks={tasks}
                        onToggle={onToggleTask}
                        onUpdate={onEditTask}
                        onDelete={onDeleteTask}
                        colorBlindMode={!!colorBlindMode}
                        isDarkMode={isDark}
                      />
                    ))
                  )}
                </View>
              );
            })}

            {/* Show "See More" button on the last page if more days available */}
            {pageIndex === pages.length - 1 && hasMoreDays && (
              <TouchableOpacity style={styles.seeMoreButton} onPress={handleLoadMore}>
                <Plus size={20} color="#ffffff" />
                <Text style={styles.seeMoreText}>See More Days</Text>
              </TouchableOpacity>
            )}
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

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.heading,
    flex: 1,
    marginLeft: 4,
  },
  settingsButton: {
    backgroundColor: colors.surfaceMuted,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: colors.heading,
  },
  noTasks: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    paddingVertical: 8,
  },
  monthSelectorContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  monthSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.heading,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 300,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.surfaceMuted,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: colors.accent,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
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
  });
}
