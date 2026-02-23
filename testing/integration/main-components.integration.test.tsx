import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Dashboard } from '../../src/components/Dashboard';
import { WeeklyView } from '../../src/components/CalendarView';
import { Settings, type SettingsData } from '../../src/components/Settings';
import { OneThingMode } from '../../src/components/OneThingMode';
import type { Task } from '../../src/types';

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

    const { getByText, getByPlaceholderText } = render(
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

    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Write tests');
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
      />
    );

    fireEvent.press(getByText('Dark'));
    expect(onUpdateSettings).toHaveBeenCalledWith({
      ...baseSettings,
      theme: 'dark',
    });
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
});
