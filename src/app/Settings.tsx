// src/app/Settings.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings as SettingsComponent } from '../components/Settings';
import { useApp } from '../contexts/AppContext';
import { useSafeBack } from '../hooks/use-Safe-Back';
import { useAppTheme } from '../hooks/use-app-theme';


export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const handleBack = useSafeBack();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
  },
});
