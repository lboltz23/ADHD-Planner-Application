import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { Task, TaskType } from '../types';
import { SettingsData } from './Settings';
import { ProgressCircle } from './ProgressCircle';
import { TaskTypeSelector } from './TaskTypeSelector';
import { TaskCard } from './TaskCard';

//Properties for CalendarView component
interface CalendarViewProps {
  onNavigateBack: () => void;
  tasks: Task[];
  onAddTask: (title: string, date: Date, type: TaskType) => void;
  onToggleTask: (id: string) => void;
  onRescheduleTask: (id: string, newDate: Date) => void;
  settings: SettingsData;
  onTriggerConfetti?: () => void;
}
// CalendarView component
export function CalendarView({
  onNavigateBack,
  tasks,
  onAddTask,
  onToggleTask,
  onRescheduleTask,
  settings,
  onTriggerConfetti,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState("");
  const [selectedType, setSelectedType] = useState<TaskType>('basic');
  const previousProgressRef = useRef(0);
  const previousDateRef = useRef<string>('');

// Function to handle adding a new task
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, selectedDate, selectedType);
      setNewTaskTitle('');
    }
  };
// Filter tasks for the selected date
  const tasksForSelectedDate = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  const completedTasksForDate = tasksForSelectedDate.filter(
    (task) => task.completed
  ).length;
  const dateProgress =
    tasksForSelectedDate.length > 0
      ? (completedTasksForDate / tasksForSelectedDate.length) * 100
      : 0;

  const currentDateString = selectedDate.toDateString();

  useEffect(() => {
    // Reset previous progress when date changes
    if (currentDateString !== previousDateRef.current) {
      previousProgressRef.current = dateProgress;
      previousDateRef.current = currentDateString;
      return;
    }

    // Trigger confetti when reaching 100%
    if (
      dateProgress === 100 &&
      previousProgressRef.current < 100 &&
      tasksForSelectedDate.length > 0 &&
      settings.confettiEnabled &&
      onTriggerConfetti
    ) {
      onTriggerConfetti();
    }
    previousProgressRef.current = dateProgress;
  }, [dateProgress, tasksForSelectedDate.length, currentDateString, settings.confettiEnabled, onTriggerConfetti]);

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };
  // Render calendar days and UI
  const calendarDays = generateCalendarDays();
  // Format month and year for header
  const monthYear = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  // Handlers for navigating months
  const handlePreviousMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };
  
  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa',
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#6b5b7f',
    },
    progressCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    calendarContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    monthTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#6b5b7f',
    },
    monthButton: {
      padding: 8,
      backgroundColor: '#f0ebf7',
      borderRadius: 6,
    },
    monthButtonText: {
      color: '#b8a4d9',
      fontWeight: '600',
    },
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekdayText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#999',
    },
    daysContainer: {
      gap: 8,
    },
    dayRow: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-start',
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
    },
    dayCellSelected: {
      backgroundColor: '#b8a4d9',
    },
    dayCellText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    dayCellTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    selectedDateSection: {
      marginBottom: 24,
    },
    selectedDateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#6b5b7f',
      marginBottom: 16,
    },
    addTaskCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#ffd89b',
      gap: 12,
    },
    typeSelector: {
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    taskInput: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5d9f2',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: '#333',
    },
    addButton: {
      backgroundColor: '#ffd89b',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tasksList: {
      gap: 8,
    },
    noTasksMessage: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    noTasksText: {
      fontSize: 14,
      color: '#999',
    },
  });

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <ArrowLeft size={20} color="#6b5b7f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressCard}>
          <ProgressCircle
            percentage={dateProgress}
            label="Selected Date Progress"
            sublabel={`${completedTasksForDate} of ${tasksForSelectedDate.length} tasks completed`}
          />
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            {/* Month Navigation */}
            <TouchableOpacity
              style={styles.monthButton}
              onPress={handlePreviousMonth}
            >
              <Text style={styles.monthButtonText}>← Prev</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthYear}</Text>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={handleNextMonth}
            >
              <Text style={styles.monthButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdayRow}>
            {weekdayLabels.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysContainer}>
            {/* Render weeks */}
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map(
              (_, weekIndex) => {
                // Get the 7-day chunk for this week
                const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);

                // Fill up the last row with placeholders
                while (weekDays.length < 7) {
                  weekDays.push(null);
                }

                return (
                  // Week row
                  <View key={weekIndex} style={styles.dayRow}>
                    {weekDays.map((day, dayIndex) => {
                      const isSelected =
                        day && day.toDateString() === selectedDate.toDateString();

                      if (day) {
                        return (
                          <TouchableOpacity
                            key={dayIndex}
                            style={[
                              styles.dayCell,
                              isSelected && styles.dayCellSelected,
                            ]}
                            onPress={() => setSelectedDate(day)}
                          >
                            <Text
                              style={[
                                styles.dayCellText,
                                isSelected && styles.dayCellTextSelected,
                              ]}
                            >
                              {day.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                      // Empty cell for alignment
                      return (
                        <View
                          key={dayIndex}
                          style={[
                            styles.dayCell,
                            { backgroundColor: 'transparent' },
                          ]}
                        />
                      );
                    })}
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* Selected Date Section */}
        <View style={styles.selectedDateSection}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {/* Add Task */}
          <View style={styles.addTaskCard}>
            <View style={styles.typeSelector}>
              <TaskTypeSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
                colorBlindMode={settings.colorBlindMode}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.taskInput}
                placeholder="Add task for this date..."
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onSubmitEditing={handleAddTask}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}
              >
                <Plus size={20} color="#4a4458" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tasks List */}
          {tasksForSelectedDate.length === 0 ? (
            <View style={styles.noTasksMessage}>
              <Text style={styles.noTasksText}>No tasks for this date</Text>
            </View>
          ) : (
            // If there are tasks, render them
            <View style={styles.tasksList}>
              {tasksForSelectedDate.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  colorBlindMode={settings.colorBlindMode}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}