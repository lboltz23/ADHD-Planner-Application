import 'react-native-gesture-handler/jestSetup';

// Silence Reanimated warnings
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-linking', () => ({
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('scheduled-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-push-token' }),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: {
    MAX: 5,
  },
}));

jest.mock('expo-router', () => {
  const React = require('react');

  const mockRouter = {
    canGoBack: jest.fn(() => true),
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  };

  const Stack = ({ children }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;

  return {
    router: mockRouter,
    useRouter: () => mockRouter,
    useFocusEffect: (effect) => {
      React.useEffect(() => effect(), [effect]);
    },
    Stack,
  };
});

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));

// Expo mocks
jest.mock('expo-constants', () => ({
  expoConfig: {},
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}
