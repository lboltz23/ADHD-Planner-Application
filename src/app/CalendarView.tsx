import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WeeklyView as CalendarComponent } from '../components/CalendarView';
import { useApp } from '../contexts/AppContext';
import { useSafeBack } from '../hooks/use-Safe-Back';
import { useAppTheme } from '../hooks/use-app-theme';


export default function CalendarViewScreen() {
  const router = useRouter();
  const { settings, toggleTask, updateTask, deleteTask, triggerConfetti } = useApp();
  const handleBack = useSafeBack();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
  },
});
