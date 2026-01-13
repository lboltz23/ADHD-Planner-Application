// src/app/OneThingMode.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OneThingMode as OneThingComponent } from '../components/OneThingMode';
import { useApp } from '../contexts/AppContext';

export default function OneThingModeScreen() {
  const router = useRouter();
  const { tasks, settings, toggleTask } = useApp();

  return (
    <View style={styles.container}>
      <OneThingComponent
        onNavigateBack={() => router.back()}
        tasks={tasks}
        onToggleTask={toggleTask}
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
