// src/types.ts
export type TaskType = "routine" | "basic" | "related" | "long_interval";

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  type: TaskType;
  time?: string;
  notes?: string;
  repeatDays?: Weekday[]; // Days of week to repeat on (for routine tasks)
  intervalMonths?: number;
  parentTaskId?: string;
  // For recurring tasks (routine and long_interval)
  startDate?: Date;
  endDate?: Date;
  scheduledDays?: Date[]; // Array of all scheduled occurrences
  isRecurring?: boolean;
  recurringTaskId?: string; // Links instances of the same recurring task
  instanceDate?: Date; // The specific date this instance represents
}

export interface CreateTaskParams {
  title: string;
  date: Date;
  type: TaskType;
  repeatDays?: Weekday[]; // Days of week to repeat on (for routine tasks)
  intervalMonths?: number;
  parentTaskId?: string;
  notes?: string;
  startDate?: Date;
  endDate?: Date;
}

