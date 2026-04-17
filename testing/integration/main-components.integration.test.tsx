import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Dashboard } from '../../src/components/Dashboard';
import { WeeklyView } from '../../src/components/CalendarView';
import { Settings, type SettingsData } from '../../src/components/Settings';
import { OneThingMode } from '../../src/components/OneThingMode';
import type { Task } from '../../src/types';
import { router } from 'expo-router';

const mockUseAppTasks: Task[] = [];

jest.mock('lucide-react-native', () => {
  const NullIcon = () => null;
  return new Proxy(
    {},
    {
      get: () => NullIcon,
    }
  );
});

jest.mock('@react-native-community/slider', () => 'Slider');

jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

jest.mock('../../src/components/AddTaskDialog', () => {
  const { Text } = require('react-native');
  return (props: { isOpen: boolean }) => (
    <Text>{props.isOpen ? 'AddTaskDialog:open' : 'AddTaskDialog:closed'}</Text>
  );
});

jest.mock('../../src/components/TaskTypeSelector', () => {
  const { Text } = require('react-native');
  return {
    TaskTypeSelector: () => <Text>TaskTypeSelectorStub</Text>,
  };
});

jest.mock('../../src/components/TaskCard', () => {
  const { Text } = require('react-native');
  return {
    TaskCard: ({ task }: { task: Task }) => <Text>{`TaskCard:${task.title}`}</Text>,
  };
});

jest.mock('../../src/components/ProgressCircle', () => {
  const { Text } = require('react-native');
  return {
    ProgressCircle: ({ percentage }: { percentage: number }) => (
      <Text>{`ProgressCircle:${Math.round(percentage)}`}</Text>
    ),
  };
});

jest.mock('../../src/contexts/AppContext', () => ({
  useApp: () => ({ tasks: mockUseAppTasks }),
}));

jest.mock('../../src/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/lib/supabaseClient', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/lib/Notifications', () => ({
  disableNotifications: jest.fn(),
  requestNotificationPermission: jest.fn(),
  scheduleTimedNotification: jest.fn(),
  cancelNotification: jest.fn(),
}));

const baseSettings: SettingsData = {
  defaultTimerMinutes: 25,
  soundEnabled: true,
  confettiEnabled: true,
  theme: 'light',
  defaultTaskView: 'all',
  colorBlindMode: false,
};

const now = new Date();
const laterToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0);

describe('main screen components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppTasks.splice(0, mockUseAppTasks.length);
  });

  test('Dashboard renders and opens add task dialog', () => {
    const onNavigateToCalendar = jest.fn();

    const { getByText } = render(
      <Dashboard
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToOneThingMode={jest.fn()}
        onNavigateToSettings={jest.fn()}
        tasks={[]}
        onAddTask={jest.fn()}
        onToggleTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        settings={baseSettings}
      />
    );

    expect(getByText('My Planner')).toBeTruthy();
    expect(getByText('No tasks for today')).toBeTruthy();
    expect(getByText('AddTaskDialog:closed')).toBeTruthy();

    fireEvent.press(getByText('Calendar'));
    expect(onNavigateToCalendar).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('+'));
    expect(getByText('AddTaskDialog:open')).toBeTruthy();
  });

  test('WeeklyView renders tasks from context and base layout', () => {
    mockUseAppTasks.push({
      id: 'week-1',
      user_id: 'user-1',
      title: 'Weekly task',
      type: 'basic',
      due_date: laterToday,
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const { getByText } = render(
      <WeeklyView
        onToggleTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        colorBlindMode={false}
        onNavigateBack={jest.fn()}
        onNavigateSettings={jest.fn()}
        settings={baseSettings}
      />
    );

    expect(getByText('Weekly Tasks')).toBeTruthy();
    expect(getByText('TaskCard:Weekly task')).toBeTruthy();
  });

  test('Settings updates selected theme option', () => {
    const onUpdateSettings = jest.fn();
    const { getByText } = render(
      <Settings
        onNavigateBack={jest.fn()}
        settings={baseSettings}
        onUpdateSettings={onUpdateSettings}
        user={null}
        username={{ username: null, loading: false }}
      />
    );

    fireEvent.press(getByText('Dark'));
    expect(onUpdateSettings).toHaveBeenCalledWith({
      ...baseSettings,
      theme: 'dark',
    });

    fireEvent.press(getByText('Login In'));
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  test('OneThingMode completes selected task', async () => {
    const onToggleTask = jest.fn();
    const onTriggerConfetti = jest.fn();
    const task: Task = {
      id: 'focus-1',
      user_id: 'user-1',
      title: 'Deep work',
      type: 'basic',
      due_date: now,
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { getAllByText, getByText } = render(
      <OneThingMode
        onNavigateBack={jest.fn()}
        tasks={[task]}
        onToggleTask={onToggleTask}
        settings={baseSettings}
        onTriggerConfetti={onTriggerConfetti}
      />
    );

    await waitFor(() => {
      expect(getAllByText('Deep work').length).toBeGreaterThan(0);
    });

    fireEvent.press(getByText('Complete Task'));
    expect(onToggleTask).toHaveBeenCalledWith('focus-1');
    expect(onTriggerConfetti).toHaveBeenCalledTimes(1);
  });

  test('Dashboard supports filters, pagination, and search across task views', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayTasks: Task[] = Array.from({ length: 9 }).map((_, idx) => ({
      id: `today-${idx + 1}`,
      user_id: 'user-1',
      title: `Today ${idx + 1}`,
      type: 'basic',
      due_date: today,
      time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0, 0),
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const tasks: Task[] = [
      ...todayTasks,
      {
        id: 'open-1',
        user_id: 'user-1',
        title: 'Overdue',
        type: 'basic',
        due_date: yesterday,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'upcoming-1',
        user_id: 'user-1',
        title: 'Tomorrow task',
        type: 'basic',
        due_date: tomorrow,
        time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 0, 0),
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'repeat-1',
        user_id: 'user-1',
        title: 'Repeating template',
        type: 'routine',
        due_date: today,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
        is_template: true,
      },
    ];

    const onNavigateToOneThingMode = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <Dashboard
        onNavigateToCalendar={jest.fn()}
        onNavigateToOneThingMode={onNavigateToOneThingMode}
        onNavigateToSettings={jest.fn()}
        tasks={tasks}
        onAddTask={jest.fn()}
        onToggleTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        settings={baseSettings}
      />
    );

    expect(getByText('Show More Tasks')).toBeTruthy();
    fireEvent.press(getByText('Show More Tasks'));
    expect(getByText('Show Less Tasks')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Search tasks...'), 'Today 8');
    expect(getByText('TaskCard:Today 8')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Search tasks...'), '');
    fireEvent.press(getByText('Open'));
    expect(getByText('TaskCard:Overdue')).toBeTruthy();

    fireEvent.press(getByText('Upcoming'));
    expect(getByText('TaskCard:Tomorrow task')).toBeTruthy();

    fireEvent.press(getByText('Repeating'));
    expect(getByText('TaskCard:Repeating template')).toBeTruthy();

    fireEvent.press(getByText('One Thing Mode'));
    expect(onNavigateToOneThingMode).toHaveBeenCalledTimes(1);
  });
});
