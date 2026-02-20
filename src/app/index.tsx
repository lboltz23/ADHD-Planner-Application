// src/app/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Dashboard } from '../components/Dashboard';
import { useApp } from '../contexts/AppContext';
import { useAppTheme } from '../hooks/use-app-theme';
// TODO: uncomment when @supabase/supabase-js is installed
// import { supabase } from '@/lib/supabaseClient';


export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, updateTask, deleteTask, triggerConfetti } = useApp();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Dashboard
        onNavigateToCalendar={() => router.push('/CalendarView')}
        onNavigateToOneThingMode={() => router.push('/OneThingMode')}
        onNavigateToSettings={() => router.push('/Settings')}
        tasks={tasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onEditTask={updateTask}
        onDeleteTask={deleteTask}
        settings={settings}
        onTriggerConfetti={triggerConfetti}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
