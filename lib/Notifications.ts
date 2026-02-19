import * as Notifications from "expo-notifications";

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}


// Local Notifications
export async function scheduleTimedNotification(title:string,body:string,seconds:number,sound:boolean) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: sound
    },
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
