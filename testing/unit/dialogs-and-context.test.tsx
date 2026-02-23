import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AddTaskDialog from '../../src/components/AddTaskDialog';
import EditTask from '../../src/components/EditTask';
import type { Task } from '../../src/types';

const mockConfirm = jest.fn();
const mockUuid = jest.fn();

const mockDb = {
  tasks: [] as Record<string, any>[],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function buildOrPredicate(orExpr: string | null) {
  if (!orExpr) {
    return () => true;
  }
  const conditions = orExpr.split(',').map((part) => part.trim());
  return (row: Record<string, any>) => {
    return conditions.some((cond) => {
      if (cond.includes('.gte.')) {
        const [col, , ...rest] = cond.split('.');
        const value = rest.join('.');
        return row[col] != null && String(row[col]) >= value;
      }
      if (cond.endsWith('.is.null')) {
        const [col] = cond.split('.');
        return row[col] == null;
      }
      return false;
    });
  };
}

function createQueryBuilder() {
  let action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  let selectedFields = '*';
  let insertPayload: Record<string, any>[] = [];
  let updatePayload: Record<string, any> = {};
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let orExpr: string | null = null;

  const execute = (single = false) => {
    const andMatch = (row: Record<string, any>) => filters.every((fn) => fn(row));
    const orMatch = buildOrPredicate(orExpr);
    const matches = (row: Record<string, any>) => andMatch(row) && orMatch(row);

    if (action === 'insert') {
      mockDb.tasks.push(...clone(insertPayload));
      return { data: clone(insertPayload), error: null };
    }

    if (action === 'update') {
      mockDb.tasks = mockDb.tasks.map((row) =>
        matches(row) ? { ...row, ...clone(updatePayload) } : row
      );
      return { data: null, error: null };
    }

    if (action === 'delete') {
      mockDb.tasks = mockDb.tasks.filter((row) => !matches(row));
      return { data: null, error: null };
    }

    let rows = mockDb.tasks.filter(matches);
    if (selectedFields !== '*') {
      const fields = selectedFields.split(',').map((part) => part.trim());
      rows = rows.map((row) => {
        const picked: Record<string, any> = {};
        fields.forEach((field) => {
          picked[field] = row[field];
        });
        return picked;
      });
    }

    if (single) {
      return { data: rows[0] ?? null, error: null };
    }
    return { data: clone(rows), error: null };
  };

  const builder: any = {
    select(fields = '*') {
      action = 'select';
      selectedFields = fields;
      return builder;
    },
    insert(payload: Record<string, any> | Record<string, any>[]) {
      action = 'insert';
      insertPayload = Array.isArray(payload) ? payload : [payload];
      return Promise.resolve(execute(false));
    },
    update(payload: Record<string, any>) {
      action = 'update';
      updatePayload = payload;
      return builder;
    },
    delete() {
      action = 'delete';
      return builder;
    },
    eq(col: string, value: any) {
      filters.push((row) => row[col] === value);
      return builder;
    },
    neq(col: string, value: any) {
      filters.push((row) => row[col] !== value);
      return builder;
    },
    gte(col: string, value: any) {
      filters.push((row) => String(row[col]) >= String(value));
      return builder;
    },
    lte(col: string, value: any) {
      filters.push((row) => String(row[col]) <= String(value));
      return builder;
    },
    or(value: string) {
      orExpr = value;
      return builder;
    },
    single() {
      return Promise.resolve(execute(true));
    },
    then(resolve: any, reject: any) {
      return Promise.resolve(execute(false)).then(resolve, reject);
    },
  };

  return builder;
}

const mockSupabase = {
  from: jest.fn(() => createQueryBuilder()),
};

jest.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

jest.mock('uuid', () => ({
  v4: () => mockUuid(),
}));

jest.mock('react-native-get-random-values', () => ({}));

jest.mock('expo-router/build/utils/splash', () => ({
  preventAutoHideAsync: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy(
    {},
    {
      get: () => Icon,
    }
  );
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-native-calendars', () => ({
  Calendar: ({ onDayPress }: { onDayPress: (day: { dateString: string }) => void }) => (
    (() => {
      const { Text } = require('react-native');
      return (
        <Text onPress={() => onDayPress({ dateString: '2026-02-20' })}>
          CalendarPress
        </Text>
      );
    })()
  ),
}));

jest.mock('../../src/components/TitleInput', () => {
  return function MockTitleInput(props: { value: string; onChange: (text: string) => void }) {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        placeholder="TitleField"
        value={props.value}
        onChangeText={props.onChange}
      />
    );
  };
});

jest.mock('../../src/components/NoteInput', () => {
  return function MockNoteInput(props: { value: string; onChange: (text: string) => void }) {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        placeholder="NoteField"
        value={props.value}
        onChangeText={props.onChange}
      />
    );
  };
});

jest.mock('../../src/components/DateRangePicker', () => {
  return function MockDateRangePicker(props: {
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
  }) {
    const { Text } = require('react-native');
    return (
      <>
        <Text onPress={() => props.onStartDateChange(new Date(2026, 1, 10))}>PickStart</Text>
        <Text onPress={() => props.onEndDateChange(new Date(2026, 1, 28))}>PickEnd</Text>
      </>
    );
  };
});

jest.mock('../../src/components/RelatedTask', () => {
  return function MockRelatedTaskInput(props: {
    tasks: Task[];
    onSelect: (id: string) => void;
  }) {
    const { Text } = require('react-native');
    return (
      <Text onPress={() => props.tasks[0] && props.onSelect(props.tasks[0].id)}>
        SelectParent
      </Text>
    );
  };
});

jest.mock('../../src/components/Confirmation', () => ({
  confirm: (...args: unknown[]) => mockConfirm(...args),
}));

describe('dialogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).alert = jest.fn();
    mockConfirm.mockResolvedValue(true);
  });

  test('AddTaskDialog creates basic, routine, related, and long interval tasks', () => {
    const onAddTask = jest.fn();
    const onClose = jest.fn();

    const { getByText, rerender, getByPlaceholderText } = render(
      <AddTaskDialog
        isOpen={true}
        onClose={onClose}
        onAddTask={onAddTask}
        initialTaskType="basic"
        initialTitle="Basic Title"
        tasks={[]}
      />
    );

    fireEvent.changeText(getByPlaceholderText('NoteField'), 'note');
    fireEvent.press(getByText('CalendarPress'));
    fireEvent.press(getByText('Create Task'));
    expect(onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Basic Title',
        type: 'basic',
      })
    );

    rerender(
      <AddTaskDialog
        isOpen={true}
        onClose={onClose}
        onAddTask={onAddTask}
        initialTaskType="routine"
        initialTitle="Routine Title"
        tasks={[]}
      />
    );

    fireEvent.press(getByText('PickStart'));
    fireEvent.press(getByText('PickEnd'));
    fireEvent.press(getByText('Mon'));
    fireEvent.press(getByText('Create Task'));
    expect(onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Routine Title',
        type: 'routine',
        days_selected: expect.arrayContaining(['Monday']),
      })
    );

    const relatedTasks: Task[] = [
      {
        id: 'parent-1',
        user_id: 'u1',
        title: 'Parent task',
        type: 'basic',
        due_date: new Date(),
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    rerender(
      <AddTaskDialog
        isOpen={true}
        onClose={onClose}
        onAddTask={onAddTask}
        initialTaskType="related"
        initialTitle="Related Title"
        tasks={relatedTasks}
      />
    );
    fireEvent.press(getByText('SelectParent'));
    fireEvent.press(getByText('CalendarPress'));
    fireEvent.press(getByText('Create Task'));
    expect(onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'related',
        parent_task_id: 'parent-1',
      })
    );

    rerender(
      <AddTaskDialog
        isOpen={true}
        onClose={onClose}
        onAddTask={onAddTask}
        initialTaskType="long_interval"
        initialTitle="Interval Title"
        tasks={[]}
      />
    );
    fireEvent.press(getByText('PickStart'));
    fireEvent.press(getByText('PickEnd'));
    fireEvent.changeText(getByPlaceholderText('e.g., 3'), '3');
    fireEvent.press(getByText('Create Task'));
    expect(onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'long_interval',
        recurrence_interval: 3,
      })
    );
  });

  test('EditTask saves, toggles completion, and deletes after confirm', async () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onToggle = jest.fn();
    const task: Task = {
      id: 'task-1',
      user_id: 'u1',
      title: 'Original',
      type: 'basic',
      due_date: new Date(2026, 1, 1),
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      notes: '',
      is_template: false,
    };

    const { getByText, getByPlaceholderText } = render(
      <EditTask
        isOpen={true}
        onClose={onClose}
        task={task}
        tasks={[]}
        onSave={onSave}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    );

    fireEvent.changeText(getByPlaceholderText('TitleField'), 'Updated title');
    fireEvent.press(getByText('CalendarPress'));
    fireEvent.press(getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({
        title: 'Updated title',
      })
    );

    fireEvent.press(getByText('Complete'));
    expect(onToggle).toHaveBeenCalledWith('task-1');

    fireEvent.press(getByText('Delete'));
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('task-1');
    });
  });
});

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    let counter = 0;
    mockUuid.mockImplementation(() => {
      counter += 1;
      return `uuid-${counter}`;
    });

    mockDb.tasks = [
      {
        id: 'basic-seeded',
        user_id: '9dfa5616-322a-4287-a980-d33754320861',
        title: 'Seed basic',
        due_date: '2026-02-20',
        completed: false,
        type: 'basic',
        notes: 'seed-note',
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
        is_template: false,
        parent_task_id: null,
      },
      {
        id: 'related-seeded',
        user_id: '9dfa5616-322a-4287-a980-d33754320861',
        title: 'Seed related',
        due_date: '2026-02-20',
        completed: false,
        type: 'related',
        notes: null,
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
        is_template: false,
        parent_task_id: 'basic-seeded',
      },
      {
        id: 'template-seeded',
        user_id: '9dfa5616-322a-4287-a980-d33754320861',
        title: 'Seed routine template',
        due_date: '2026-02-01',
        completed: false,
        type: 'routine',
        notes: 'template-note',
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
        is_template: true,
        start_date: '2026-02-01',
        end_date: '2026-02-10',
        days_selected: ['Monday', 'Wednesday'],
        recurrence_interval: null,
        completed_dates: ['2026-02-02'],
        excluded_dates: ['2026-02-05'],
        parent_task_id: null,
      },
      {
        id: 'override-seeded',
        user_id: '9dfa5616-322a-4287-a980-d33754320861',
        title: 'Seed override',
        due_date: '2026-02-02',
        completed: true,
        type: 'routine',
        notes: null,
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
        is_template: false,
        parent_task_id: 'template-seeded',
      },
    ];
  });

  test('AppProvider supports task lifecycle, settings updates, and monthly fetch', async () => {
    const { AppProvider, useApp } = require('../../src/contexts/AppContext');
    let api: any = null;

    function Probe() {
      api = useApp();
      return (
        <Text>{`tasks:${api.tasks.length}|theme:${api.settings.theme}|confetti:${api.confettiTrigger}|streak:${api.streakCount}`}</Text>
      );
    }

    render(
      <AppProvider>
        <Probe />
      </AppProvider>
    );

    await waitFor(() => {
      expect(api.tasks.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await api.addTask({
        title: 'New basic',
        type: 'basic',
        due_date: new Date(2026, 1, 21),
      });
    });
    expect(api.tasks.some((t: Task) => t.title === 'New basic')).toBe(true);

    await act(async () => {
      await api.addTask({
        title: 'New routine',
        type: 'routine',
        due_date: new Date(2026, 1, 1),
        start_date: new Date(2026, 1, 1),
        end_date: new Date(2026, 1, 8),
        days_selected: ['Monday'],
      });
    });
    expect(api.tasks.some((t: Task) => t.is_template && t.title === 'New routine')).toBe(true);

    const basicTask = api.tasks.find((t: Task) => t.title === 'New basic');
    await act(async () => {
      await api.toggleTask(basicTask.id);
    });

    const inMemoryInstance = api.tasks.find(
      (t: Task) => t.parent_task_id && t.id.includes('_')
    );
    if (inMemoryInstance) {
      await act(async () => {
        await api.toggleTask(inMemoryInstance.id);
      });
      await act(async () => {
        await api.updateTask(inMemoryInstance.id, { title: 'Updated in-memory instance' });
      });
      await act(async () => {
        await api.deleteTask(inMemoryInstance.id);
      });
    }

    await act(async () => {
      await api.updateTask(basicTask.id, {
        title: 'Updated basic title',
        notes: 'updated note',
      });
    });

    await act(async () => {
      await api.deleteTask('basic-seeded');
    });

    await act(async () => {
      api.updateSettings({
        ...api.settings,
        theme: 'dark',
      });
      api.triggerConfetti();
      api.login();
    });

    await waitFor(() => {
      expect(api.settings.theme).toBe('dark');
      expect(api.confettiTrigger).toBeGreaterThan(0);
      expect(api.streakCount).toBeGreaterThan(0);
    });

    let monthTasks: Task[] = [];
    await act(async () => {
      monthTasks = await api.fetchTasksForMonth(2026, 1);
    });
    expect(Array.isArray(monthTasks)).toBe(true);
  });
});
