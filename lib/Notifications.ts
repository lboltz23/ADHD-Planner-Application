import * as Notifications from "expo-notifications";

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task Reminder",
      body: "Time to complete your task!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
    },
  });
}

export async function disableNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Add reschedule function on renable.
// Add task adding
