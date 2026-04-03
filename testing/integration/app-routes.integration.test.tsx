import React from 'react';
import { act, render } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockSafeBack = jest.fn();
const mockDashboardProps = jest.fn();
const mockCalendarProps = jest.fn();
const mockSettingsProps = jest.fn();
const mockOneThingProps = jest.fn();
const mockConfettiProps = jest.fn();

const mockAppState = {
  tasks: [
    {
      id: 'task-1',
      user_id: 'user-1',
      title: 'Task one',
      type: 'basic' as const,
      due_date: new Date(),
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  settings: {
    defaultTimerMinutes: 25,
    soundEnabled: true,
    confettiEnabled: true,
    theme: 'light' as const,
    defaultTaskView: 'all' as const,
    colorBlindMode: false,
  },
  addTask: jest.fn(),
  toggleTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  updateSettings: jest.fn(),
  streakCount: 0,
  login: jest.fn(),
  confettiTrigger: 3,
  triggerConfetti: jest.fn(),
  fetchTasksForMonth: jest.fn(),
};

jest.mock('expo-router', () => {
  const ReactLocal = require('react');
  const { Text: RNText, View } = require('react-native');

  const Stack = ({ children }: { children: React.ReactNode }) => (
    <View testID="mock-stack">{children}</View>
  );
  Stack.Screen = ({ name }: { name: string }) => <RNText>{`screen:${name}`}</RNText>;

  return {
    useRouter: () => ({ push: mockPush }),
    Stack,
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: ({ style }: { style: string }) => {
    const { Text } = require('react-native');
    return <Text>{`status:${style}`}</Text>;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useApp: () => mockAppState,
}));

jest.mock('../../src/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: { background: '#ffffff' },
    isDark: false,
    resolvedTheme: 'light',
  }),
}));

jest.mock('../../src/hooks/use-Safe-Back', () => ({
  useSafeBack: () => mockSafeBack,
}));

jest.mock('../../src/components/Dashboard', () => ({
  Dashboard: (props: unknown) => {
    const { Text } = require('react-native');
    mockDashboardProps(props);
    return <Text>DashboardStub</Text>;
  },
}));

jest.mock('../../src/components/CalendarView', () => ({
  WeeklyView: (props: unknown) => {
    const { Text } = require('react-native');
    mockCalendarProps(props);
    return <Text>CalendarStub</Text>;
  },
}));

jest.mock('../../src/components/Settings', () => ({
  Settings: (props: unknown) => {
    const { Text } = require('react-native');
    mockSettingsProps(props);
    return <Text>SettingsStub</Text>;
  },
}));

jest.mock('../../src/components/OneThingMode', () => ({
  OneThingMode: (props: unknown) => {
    const { Text } = require('react-native');
    mockOneThingProps(props);
    return <Text>OneThingStub</Text>;
  },
}));

jest.mock('../../src/components/ConfettiOverlay', () => ({
  ConfettiOverlay: (props: unknown) => {
    const { Text } = require('react-native');
    mockConfettiProps(props);
    return <Text>ConfettiStub</Text>;
  },
}));

describe('app route screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('index route wires dashboard actions and navigation', () => {
    const Screen = require('../../src/app/index').default;
    render(<Screen />);

    const props = mockDashboardProps.mock.calls[0][0];
    expect(props.tasks).toBe(mockAppState.tasks);
    expect(props.settings).toBe(mockAppState.settings);

    act(() => props.onNavigateToCalendar());
    act(() => props.onNavigateToOneThingMode());
    act(() => props.onNavigateToSettings());

    expect(mockPush).toHaveBeenCalledWith('/CalendarView');
    expect(mockPush).toHaveBeenCalledWith('/OneThingMode');
    expect(mockPush).toHaveBeenCalledWith('/Settings');
  });

  test('calendar route passes safe back and settings navigation', () => {
    const Screen = require('../../src/app/CalendarView').default;
    render(<Screen />);

    const props = mockCalendarProps.mock.calls[0][0];
    expect(props.onNavigateBack).toBe(mockSafeBack);

    act(() => props.onNavigateSettings());
    expect(mockPush).toHaveBeenCalledWith('/Settings');
  });

  test('settings route passes state and handlers', () => {
    const Screen = require('../../src/app/Settings').default;
    render(<Screen />);

    const props = mockSettingsProps.mock.calls[0][0];
    expect(props.onNavigateBack).toBe(mockSafeBack);
    expect(props.settings).toBe(mockAppState.settings);
    expect(props.onUpdateSettings).toBe(mockAppState.updateSettings);
  });

  test('one thing mode route passes state and handlers', () => {
    const Screen = require('../../src/app/OneThingMode').default;
    render(<Screen />);

    const props = mockOneThingProps.mock.calls[0][0];
    expect(props.onNavigateBack).toBe(mockSafeBack);
    expect(props.tasks).toBe(mockAppState.tasks);
    expect(props.onToggleTask).toBe(mockAppState.toggleTask);
  });

  test('layout renders stack, status bar, and confetti overlay', () => {
    const Layout = require('../../src/app/_layout').default;
    const { getByText } = render(<Layout />);

    expect(getByText('screen:index')).toBeTruthy();
    expect(getByText('screen:CalendarView')).toBeTruthy();
    expect(getByText('screen:OneThingMode')).toBeTruthy();
    expect(getByText('screen:Settings')).toBeTruthy();
    expect(getByText('status:dark')).toBeTruthy();

    const confettiProps = mockConfettiProps.mock.calls[0][0];
    expect(confettiProps.trigger).toBe(3);
  });
});
