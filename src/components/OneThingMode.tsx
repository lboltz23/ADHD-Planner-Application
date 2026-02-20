import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task } from '../types';
import { SettingsData } from './Settings';
import { getTaskTypeColor } from './taskColors';
import { AppThemeColors, resolveThemePreference } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

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
  const systemScheme = useColorScheme();
  const resolvedTheme = resolveThemePreference(settings.theme, systemScheme);
  const colors = AppThemeColors[resolvedTheme];
  const isDark = resolvedTheme === 'dark';

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [timeInSeconds, setTimeInSeconds] = useState(
    settings.defaultTimerMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [shownIntervals, setShownIntervals] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  // Get incomplete tasks for today
  const incompleteTasks = tasks.filter((task) => {
    const today = new Date();
    const taskDate = new Date(task.due_date);
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
          const newTime = prev - 1;
          const initialSeconds = settings.defaultTimerMinutes * 60;

          // Check for key intervals
          checkKeyIntervals(newTime, initialSeconds);

          if (newTime <= 0) {
            setIsRunning(false);
            setHasCompleted(true);
            if (settings.confettiEnabled && onTriggerConfetti) {
              onTriggerConfetti();
            }
            triggerPulseAnimation();
            return 0;
          }
          return newTime;
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
  }, [isRunning, timeInSeconds, settings.confettiEnabled, settings.defaultTimerMinutes, onTriggerConfetti, shownIntervals]);

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

  const playSound = () => {
    // Only play sound if enabled in settings
    if (!settings.soundEnabled) {
      return;
    }

    // Use native alert sound on both iOS and Android
    try {
      // For web and Expo, we can use the Web Audio API
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Sound not available in this environment');
    }
  };

  const showTimerAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlertPopup(true);
    playSound();

    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }

    popupTimeoutRef.current = setTimeout(() => {
      setShowAlertPopup(false);
    }, 3000);
  };

  const checkKeyIntervals = (seconds: number, initialSeconds: number) => {
    const keyIntervals = [
      { seconds: 60, label: '1 minute' },
      { seconds: 300, label: '5 minutes' },
      { seconds: 1800, label: '30 minutes' },
      { seconds: Math.floor(initialSeconds / 2), label: 'Half time reached' },
    ];

    keyIntervals.forEach((interval) => {
      if (seconds === interval.seconds && !shownIntervals.has(interval.seconds)) {
        showTimerAlert(interval.label);
        setShownIntervals((prev) => new Set(prev).add(interval.seconds));
      }
    });
  };

  const toggleTimer = () => {
    // If timer is at 0, reset and start it
    if (timeInSeconds === 0) {
      setTimeInSeconds(settings.defaultTimerMinutes * 60);
      setShownIntervals(new Set());
      setIsRunning(true);
      setHasCompleted(false);
    } else {
      setIsRunning(!isRunning);
      setHasCompleted(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeInSeconds(settings.defaultTimerMinutes * 60);
    setHasCompleted(false);
    setShownIntervals(new Set());
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
      backgroundColor: colors.background,
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
      color: colors.heading,
    },
    mainCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 32,
      minHeight: 500,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textMuted,
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
      backgroundColor: colors.accent,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    completeButton: {
      backgroundColor: colors.success,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    completeButtonText: {
      color: isDark ? '#102019' : '#4a4458',
      fontSize: 16,
      fontWeight: '600',
    },
    noTasksContainer: {
      alignItems: 'center',
      gap: 12,
    },
    noTasksText: {
      fontSize: 18,
      color: colors.textMuted,
      fontWeight: '500',
    },
    noTasksSubtext: {
      fontSize: 14,
      color: colors.textMuted,
    },
    switchFocusSection: {
      marginTop: 12,
      gap: 12,
    },
    switchFocusTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.heading,
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
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    taskSelectorCardSelected: {
      borderColor: taskColor,
      backgroundColor: colors.inputBackground,
    },
    taskDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    taskSelectorText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    alertPopupOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    alertPopupCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      gap: 16,
      borderWidth: 2,
      borderColor: colors.accent,
      maxWidth: 300,
    },
    alertPopupText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.heading,
      textAlign: 'center',
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
            <ArrowLeft size={20} color={colors.heading} />
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
                  <RotateCcw size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Complete Task Button */}
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteTask}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={20} color={isDark ? '#102019' : '#4a4458'} />
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

      {/* Alert Popup */}
      {showAlertPopup && (
        <View style={styles.alertPopupOverlay}>
          <View style={styles.alertPopupCard}>
            <Bell size={32} color={colors.accent} />
            <Text style={styles.alertPopupText}>{alertMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
