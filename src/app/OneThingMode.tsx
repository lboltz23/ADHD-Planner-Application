// src/app/OneThingMode.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OneThingMode as OneThingComponent } from '../components/OneThingMode';
import { useApp } from '../contexts/AppContext';

export default function OneThingModeScreen() {
  const router = useRouter();
  const { tasks, settings, toggleTask, triggerConfetti } = useApp();

  return (
    <View style={styles.container}>
      <OneThingComponent
        onNavigateBack={() => router.back()}
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
    backgroundColor: '#fff',
  },
});
