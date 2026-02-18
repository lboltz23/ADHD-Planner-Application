import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WeeklyView as CalendarComponent } from '../components/CalendarView';
import { useApp } from '../contexts/AppContext';
import { useSafeBack } from '../hooks/use-Safe-Back';


export default function CalendarViewScreen() {
  const router = useRouter();
  const { settings, toggleTask, updateTask, deleteTask, triggerConfetti } = useApp();
  const handleBack = useSafeBack();

  return (
    <View style={styles.container}>
      <CalendarComponent
        onNavigateBack={handleBack}
        onNavigateSettings={() => router.push('/Settings')}
        onToggleTask={toggleTask}
        colorBlindMode={settings.colorBlindMode}
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