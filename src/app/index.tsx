// src/app/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Dashboard } from '../components/Dashboard';
import { useApp } from '../contexts/AppContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask } = useApp();

  return (
    <View style={styles.container}>
      <Dashboard
        onNavigateToCalendar={() => router.push('/CalendarView')}
        onNavigateToOneThingMode={() => router.push('/OneThingMode')}
        onNavigateToSettings={() => router.push('/Settings')}
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