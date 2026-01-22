// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../contexts/AppContext';

export default function Layout() {
  return (
    <SafeAreaProvider >
      <AppProvider>
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
      </AppProvider>
    </SafeAreaProvider>
  );
}
