// src/app/Settings.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();


  // Fixed bug, when reloading on seetings screen it saved setting screen as root
  // Will allow movement through screens without getting stuck on settings screen
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // goes to _index.tsx
    }
  };

  return (
    <View style={styles.container}>
      <SettingsComponent
        onNavigateBack={handleBack}
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