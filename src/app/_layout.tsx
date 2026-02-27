// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { AppProvider, useApp } from '../contexts/AppContext';
import { useAppTheme } from '../hooks/use-app-theme';

function RootLayoutContent() {
  const { confettiTrigger } = useApp();
  const { colors, isDark } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="CalendarView" />
        <Stack.Screen name="OneThingMode" />
        <Stack.Screen name="Settings" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name ="ResetPass"/>
      </Stack>
      <ConfettiOverlay trigger={confettiTrigger} />
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider >
      <AppProvider>
        <RootLayoutContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
