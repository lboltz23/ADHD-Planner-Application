// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { AppProvider, useApp } from '../contexts/AppContext';

function RootLayoutContent() {
  const { confettiTrigger } = useApp();

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="CalendarView" />
        <Stack.Screen name="OneThingMode" />
        <Stack.Screen name="Settings" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
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
