// src/app/Settings.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();

  return (
    <View style={styles.container}>
      <SettingsComponent
        onNavigateBack={() => router.back()}
        settings={settings}
        onUpdateSettings={updateSettings}
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