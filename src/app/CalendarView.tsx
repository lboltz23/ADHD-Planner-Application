// src/app/CalendarView.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarView as CalendarComponent } from '../components/CalendarView';
import { useApp } from '../contexts/AppContext';

export default function CalendarViewScreen() {
  const router = useRouter();
  const { tasks, settings, addTask, toggleTask, updateTask, deleteTask, triggerConfetti } = useApp();

  return (
    <View style={styles.container}>
      <CalendarComponent
        onNavigateBack={() => router.back()}
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
    backgroundColor: '#fff',
  },
});