// src/app/index.tsx
import React, {useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Dashboard } from '../components/Dashboard';
import { useApp } from '../contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';


export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, rescheduleTask, triggerConfetti } = useApp();

 useEffect(() => {
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Supabase tasks:', data);
        // later: sync these into AppContext
      }
    };

    loadTasks();
  }, []);

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