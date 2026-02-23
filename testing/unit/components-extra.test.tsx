import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import DateRangePicker from '../../src/components/DateRangePicker';
import NoteInput from '../../src/components/NoteInput';
import RelatedTaskInput from '../../src/components/RelatedTask';
import { TaskTypeSelector } from '../../src/components/TaskTypeSelector';
import { TaskCard } from '../../src/components/TaskCard';
import { ProgressCircle } from '../../src/components/ProgressCircle';
import { ConfettiOverlay } from '../../src/components/ConfettiOverlay';
import type { Task } from '../../src/types';

const mockPickerDate = new Date(2026, 1, 15);
const mockConfettiStart = jest.fn();
const mockDropdownData = jest.fn();
const mockUseAppTheme = jest.fn();

jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');
  const Icon = ({ color }: { color?: string }) => <Text>{`icon:${color || ''}`}</Text>;
  return new Proxy(
    {},
    {
      get: () => Icon,
    }
  );
});

jest.mock('react-native-modal-datetime-picker', () => {
  const { Text } = require('react-native');
  return ({ isVisible, onConfirm, onCancel }: any) =>
    isVisible ? (
      <>
        <Text onPress={() => onConfirm(mockPickerDate)}>confirm-picker</Text>
        <Text onPress={onCancel}>cancel-picker</Text>
      </>
    ) : null;
});

jest.mock('react-native-element-dropdown', () => {
  const { Text } = require('react-native');
  return {
    Dropdown: ({ data, onChange }: any) => {
      mockDropdownData(data);
      return <Text onPress={() => data[0] && onChange(data[0])}>DropdownMock</Text>;
    },
  };
});

jest.mock('../../src/hooks/use-app-theme', () => ({
  useAppTheme: () => mockUseAppTheme(),
}));

jest.mock('../../src/components/EditTask', () => {
  const { Text } = require('react-native');
  return ({ isOpen }: { isOpen: boolean }) => <Text>{`EditTask:${isOpen}`}</Text>;
});

jest.mock('react-native-confetti-cannon', () => {
  const ReactLocal = require('react');
  const { Text } = require('react-native');
  return ReactLocal.forwardRef((_: unknown, ref: any) => {
    ReactLocal.useImperativeHandle(ref, () => ({
      start: mockConfettiStart,
    }));
    return <Text>ConfettiMock</Text>;
  });
});

describe('extra UI components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppTheme.mockReturnValue({
      colors: {
        text: '#111',
        textMuted: '#666',
        border: '#ddd',
        surfaceMuted: '#f1f1f1',
        surface: '#fff',
      },
      isDark: false,
      resolvedTheme: 'light',
    });
  });

  test('NoteInput renders and calls onChange', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <NoteInput value="" onChange={onChange} />
    );

    expect(getByText('Notes: ')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Enter notes here...'), 'details');
    expect(onChange).toHaveBeenCalledWith('details');
  });

  test('DateRangePicker opens both pickers and emits selected dates', () => {
    const onStartDateChange = jest.fn();
    const onEndDateChange = jest.fn();
    const { getAllByText, getByText } = render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    );

    fireEvent.press(getAllByText('Select date')[0]);
    fireEvent.press(getByText('confirm-picker'));
    expect(onStartDateChange).toHaveBeenCalledWith(mockPickerDate);

    fireEvent.press(getAllByText('Select date')[1]);
    fireEvent.press(getByText('confirm-picker'));
    expect(onEndDateChange).toHaveBeenCalledWith(mockPickerDate);
  });

  test('RelatedTaskInput handles empty and selectable task lists', () => {
    const { getByText, rerender } = render(
      <RelatedTaskInput tasks={[]} selectedTaskId="" onSelect={jest.fn()} />
    );
    expect(getByText(/No tasks available/)).toBeTruthy();

    const onSelect = jest.fn();
    const tasks: Task[] = [
      {
        id: 'basic-1',
        user_id: 'u1',
        title: 'Basic task',
        type: 'basic',
        due_date: new Date(),
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'completed-1',
        user_id: 'u1',
        title: 'Done task',
        type: 'basic',
        due_date: new Date(),
        completed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    rerender(<RelatedTaskInput tasks={tasks} selectedTaskId="" onSelect={onSelect} />);
    fireEvent.press(getByText('DropdownMock'));
    expect(mockDropdownData).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('basic-1');
  });

  test('TaskTypeSelector emits selected type', () => {
    const onSelectType = jest.fn();
    const { getByText } = render(
      <TaskTypeSelector selectedType="basic" onSelectType={onSelectType} />
    );

    fireEvent.press(getByText('Routine'));
    expect(onSelectType).toHaveBeenCalledWith('routine');
  });

  test('TaskCard opens edit dialog and shows formatted date', () => {
    const task: Task = {
      id: 'task-1',
      user_id: 'u1',
      title: 'Write docs',
      type: 'basic',
      due_date: new Date(2026, 1, 20),
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { getByText } = render(
      <TaskCard
        task={task}
        onToggle={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        showDate={true}
      />
    );

    expect(getByText('Write docs')).toBeTruthy();
    fireEvent.press(getByText('Write docs'));
    expect(getByText('EditTask:true')).toBeTruthy();
  });

  test('ProgressCircle renders rounded percentage and labels', () => {
    const { getByText } = render(
      <ProgressCircle percentage={42.6} label="Daily" sublabel="4/10 tasks" />
    );

    expect(getByText('43%')).toBeTruthy();
    expect(getByText('Daily')).toBeTruthy();
    expect(getByText('4/10 tasks')).toBeTruthy();
  });

  test('ConfettiOverlay starts animation when trigger increments', () => {
    jest.useFakeTimers();
    const { rerender } = render(<ConfettiOverlay trigger={0} />);
    rerender(<ConfettiOverlay trigger={1} />);
    expect(mockConfettiStart).toHaveBeenCalledTimes(1);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
});
