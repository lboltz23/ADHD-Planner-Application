// src/app/OneThingMode.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OneThingMode as OneThingComponent } from '../components/OneThingMode';
import { useApp } from '../contexts/AppContext';
import { useSafeBack } from '../hooks/use-Safe-Back';
import { useAppTheme } from '../hooks/use-app-theme';


export default function OneThingModeScreen() {
  const router = useRouter();
  const { tasks, settings, toggleTask, triggerConfetti } = useApp();
  const handleBack = useSafeBack();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OneThingComponent
        onNavigateBack={handleBack}
        tasks={tasks}
        onToggleTask={toggleTask}
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
