// src/app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Dashboard } from '../components/Dashboard';
import { useApp } from '../contexts/AppContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask, triggerConfetti } = useApp();

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
        onTriggerConfetti={triggerConfetti}
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