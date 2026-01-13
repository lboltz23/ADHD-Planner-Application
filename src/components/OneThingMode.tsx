import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';
import { Task } from '../types';
import { SettingsData } from './Settings';
import { getTaskTypeColor } from './taskColors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OneThingModeProps {
  onNavigateBack: () => void;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  settings: SettingsData;
  onTriggerConfetti?: () => void;
}

export function OneThingMode({
  onNavigateBack,
  tasks,
  onToggleTask,
  settings,
  onTriggerConfetti,
}: OneThingModeProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [timeInSeconds, setTimeInSeconds] = useState(
    settings.defaultTimerMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get incomplete tasks for today
  const incompleteTasks = tasks.filter((task) => {
    const today = new Date();
    const taskDate = new Date(task.date);
    return taskDate.toDateString() === today.toDateString() && !task.completed;
  });

  // Auto-select first task if none selected
  useEffect(() => {
    if (!selectedTaskId && incompleteTasks.length > 0) {
      setSelectedTaskId(incompleteTasks[0].id);
    }
  }, [incompleteTasks, selectedTaskId]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeInSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimeInSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            if (settings.confettiEnabled && onTriggerConfetti) {
              onTriggerConfetti();
            }
            triggerPulseAnimation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeInSeconds, settings.confettiEnabled, onTriggerConfetti]);

  const triggerPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    setHasCompleted(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeInSeconds(settings.defaultTimerMinutes * 60);
    setHasCompleted(false);
  };

  const handleCompleteTask = () => {
    if (selectedTaskId) {
      onToggleTask(selectedTaskId);
      if (settings.confettiEnabled && onTriggerConfetti) {
        onTriggerConfetti();
      }
      triggerPulseAnimation();

      // Select next incomplete task
      const currentIndex = incompleteTasks.findIndex(
        (t) => t.id === selectedTaskId
      );
      if (currentIndex < incompleteTasks.length - 1) {
        setSelectedTaskId(incompleteTasks[currentIndex + 1].id);
      } else if (incompleteTasks.length > 1) {
        setSelectedTaskId(incompleteTasks[0].id);
      }
      resetTimer();
    }
  };

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  const taskColor = selectedTask
    ? getTaskTypeColor(selectedTask.type, settings.colorBlindMode)
    : '#b8a4d9';

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
    mainCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 32,
      minHeight: 500,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#e5d9f2',
    },
    focusArea: {
      alignItems: 'center',
      gap: 32,
      width: '100%',
    },
    taskInfoContainer: {
      alignItems: 'center',
      gap: 16,
    },
    focusLabel: {
      fontSize: 14,
      color: '#999',
    },
    taskTitle: {
      fontSize: 28,
      fontWeight: '600',
      color: taskColor,
      textAlign: 'center',
      maxWidth: 300,
    },
    timerContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerDisplay: {
      fontSize: 80,
      fontWeight: '700',
      fontFamily: 'Courier New',
      color: taskColor,
      letterSpacing: 2,
      textAlign: 'center',
    },
    completedBadge: {
      position: 'absolute',
      top: -20,
      right: -20,
    },
    timerControls: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    playButton: {
      backgroundColor: '#b8a4d9',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    playButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    resetButton: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5d9f2',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    completeButton: {
      backgroundColor: '#b4e7ce',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    completeButtonText: {
      color: '#4a4458',
      fontSize: 16,
      fontWeight: '600',
    },
    noTasksContainer: {
      alignItems: 'center',
      gap: 12,
    },
    noTasksText: {
      fontSize: 18,
      color: '#999',
      fontWeight: '500',
    },
    noTasksSubtext: {
      fontSize: 14,
      color: '#ccc',
    },
    switchFocusSection: {
      marginTop: 12,
      gap: 12,
    },
    switchFocusTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6b5b7f',
      marginBottom: 8,
    },
    taskSelectorList: {
      gap: 8,
    },
    taskSelectorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    taskSelectorCardSelected: {
      borderColor: taskColor,
      backgroundColor: '#f8f6fb',
    },
    taskDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    taskSelectorText: {
      fontSize: 14,
      color: '#333',
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <ArrowLeft size={20} color="#6b5b7f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>One Thing Mode</Text>
        </View>

        {/* Main Focus Area */}
        <View style={styles.mainCard}>
          {selectedTask ? (
            <View style={styles.focusArea}>
              {/* Task Info */}
              <View style={styles.taskInfoContainer}>
                <Text style={styles.focusLabel}>Focus on</Text>
                <Text style={styles.taskTitle}>{selectedTask.title}</Text>
              </View>

              {/* Timer Display */}
              <Animated.View
                style={[
                  styles.timerContainer,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.timerDisplay}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                {hasCompleted && (
                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={48} color="#b4e7ce" />
                  </View>
                )}
              </Animated.View>

              {/* Timer Controls */}
              <View style={styles.timerControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={toggleTimer}
                  activeOpacity={0.8}
                >
                  {isRunning ? (
                    <>
                      <Pause size={20} color="#ffffff" />
                      <Text style={styles.playButtonText}>Pause</Text>
                    </>
                  ) : (
                    <>
                      <Play size={20} color="#ffffff" />
                      <Text style={styles.playButtonText}>Start</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetTimer}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={20} color="#b8a4d9" />
                </TouchableOpacity>
              </View>

              {/* Complete Task Button */}
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteTask}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={20} color="#4a4458" />
                <Text style={styles.completeButtonText}>Complete Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>No tasks for today</Text>
              <Text style={styles.noTasksSubtext}>Add some tasks to get started!</Text>
            </View>
          )}
        </View>

        {/* Task Selector */}
        {incompleteTasks.length > 0 && (
          <View style={styles.switchFocusSection}>
            <Text style={styles.switchFocusTitle}>Switch Focus</Text>
            <View style={styles.taskSelectorList}>
              {incompleteTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskSelectorCard,
                    selectedTaskId === task.id &&
                      styles.taskSelectorCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedTaskId(task.id);
                    resetTimer();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.taskDot,
                      {
                        backgroundColor: getTaskTypeColor(
                          task.type,
                          settings.colorBlindMode
                        ),
                      },
                    ]}
                  />
                  <Text style={styles.taskSelectorText}>{task.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}