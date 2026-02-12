// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { AppProvider, useApp } from '../contexts/AppContext';
import * as Notifications from "expo-notifications"
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


function RootLayoutContent() {
  const { confettiTrigger } = useApp();
  useEffect(() => {
    // Android requires a notification channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }, []);

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
      </Stack>
      <ConfettiOverlay trigger={confettiTrigger} />
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
