// src/app/CalendarView.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarView as CalendarComponent } from '../components/CalendarView';
import { useApp } from '../contexts/AppContext';

export default function CalendarViewScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask } = useApp();

  return (
    <View style={styles.container}>
      <CalendarComponent
        onNavigateBack={() => router.back()}
        tasks={tasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onRescheduleTask={rescheduleTask}
        settings={settings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});