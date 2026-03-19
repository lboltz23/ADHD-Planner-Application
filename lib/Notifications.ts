import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const SOUND_CHANNEL_ID = "planner-with-sound";
const SILENT_CHANNEL_ID = "planner-silent";

async function ensureAndroidNotificationChannels() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(SOUND_CHANNEL_ID, {
    name: "Planner reminders",
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: [0, 250, 200, 250],
    sound: "default",
  });

  await Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
    name: "Planner reminders (silent)",
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: [0, 250, 200, 250],
    sound: null,
  });
}

export async function requestNotificationPermission() {
  await ensureAndroidNotificationChannels();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}


// Local Notifications
export async function scheduleTimedNotification(title:string,body:string,seconds:number,sound:boolean): Promise<string> {
  await ensureAndroidNotificationChannels();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: sound,
      vibrate: [0, 250, 200, 250],
    },
    ...(Platform.OS === "android"
      ? { channelId: sound ? SOUND_CHANNEL_ID : SILENT_CHANNEL_ID }
      : {}),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds,
      repeats: false,
    },
  });

  return id;
}


// weekday: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
// hour: 0-23, minute: 0-59
export async function scheduleWeeklyNotification(
  title: string,
  body: string,
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  hour: number,
  minute: number,
  sound: boolean = true
): Promise<string> {
  await ensureAndroidNotificationChannels();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound,
      vibrate: [0, 250, 200, 250],
    },
    ...(Platform.OS === "android"
      ? { channelId: sound ? SOUND_CHANNEL_ID : SILENT_CHANNEL_ID }
      : {}),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function disableNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
