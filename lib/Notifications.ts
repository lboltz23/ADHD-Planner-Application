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
export async function scheduleTimedNotification(title:string,body:string,seconds:number,sound:boolean) {
  await ensureAndroidNotificationChannels();

  await Notifications.scheduleNotificationAsync({
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
}


export async function disableNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Add reschedule function on renable.
// Add task adding
