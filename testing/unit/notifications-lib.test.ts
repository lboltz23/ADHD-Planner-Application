describe('Notifications helpers', () => {
  const loadModule = (platformOS: 'android' | 'ios') => {
    const mockSetNotificationChannelAsync = jest.fn().mockResolvedValue(undefined);
    const mockRequestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
    const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('notif-id');
    const mockCancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);
    const mockCancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);

    jest.resetModules();
    jest.doMock('expo-notifications', () => ({
      AndroidImportance: { HIGH: 5 },
      SchedulableTriggerInputTypes: {
        TIME_INTERVAL: 'time-interval',
        WEEKLY: 'weekly',
      },
      setNotificationChannelAsync: mockSetNotificationChannelAsync,
      requestPermissionsAsync: mockRequestPermissionsAsync,
      scheduleNotificationAsync: mockScheduleNotificationAsync,
      cancelScheduledNotificationAsync: mockCancelScheduledNotificationAsync,
      cancelAllScheduledNotificationsAsync: mockCancelAllScheduledNotificationsAsync,
    }));

    jest.doMock('react-native', () => ({
      Platform: {
        OS: platformOS,
      },
    }));

    const module = require('../../lib/Notifications');

    return {
      module,
      mockSetNotificationChannelAsync,
      mockRequestPermissionsAsync,
      mockScheduleNotificationAsync,
      mockCancelScheduledNotificationAsync,
      mockCancelAllScheduledNotificationsAsync,
    };
  };

  test('requests permission and configures Android channels', async () => {
    const { module, mockSetNotificationChannelAsync, mockRequestPermissionsAsync } =
      loadModule('android');

    const granted = await module.requestNotificationPermission();

    expect(granted).toBe(true);
    expect(mockSetNotificationChannelAsync).toHaveBeenCalledTimes(2);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  test('schedules timed and weekly notifications with expected trigger payloads', async () => {
    const { module, mockScheduleNotificationAsync } = loadModule('android');

    const timedId = await module.scheduleTimedNotification('A', 'B', 90, true);
    const weeklyId = await module.scheduleWeeklyNotification('A', 'B', 2, 9, 30, false);

    expect(timedId).toBe('notif-id');
    expect(weeklyId).toBe('notif-id');
    expect(mockScheduleNotificationAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        trigger: expect.objectContaining({
          type: 'time-interval',
          seconds: 90,
          repeats: false,
        }),
      })
    );
    expect(mockScheduleNotificationAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        trigger: expect.objectContaining({
          type: 'weekly',
          weekday: 2,
          hour: 9,
          minute: 30,
        }),
      })
    );
  });

  test('cancels one or all notifications', async () => {
    const {
      module,
      mockCancelScheduledNotificationAsync,
      mockCancelAllScheduledNotificationsAsync,
    } = loadModule('ios');

    await module.cancelNotification('abc');
    await module.disableNotifications();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('abc');
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
