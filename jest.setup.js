import 'react-native-gesture-handler/jestSetup';

// Silence Reanimated warnings
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

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