// src/types.ts
export type TaskType = "routine" | "basic" | "related" | "long_interval";

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  type: TaskType;
  due_date: Date;
  time?: Date;
  completed: boolean;
  created_at: Date;
  updated_at: Date;

  start_date?: Date; // For routine tasks
  end_date?: Date;   // For routine tasks
  notes?: string;
  days_selected?: Weekday[]; // For routine tasks
  recurrence_interval?: number; // For long interval tasks
  parent_task_id?: string; // For templates, refers to the template task ID
  is_template?: boolean; // Whether this is a recurring template
  completed_dates?: string[]; // For recurring templates, tracks which dates have been completed
  excluded_dates?: string[]; // For recurring templates, tracks which instance dates have been deleted
}

export interface CreateTaskParams {
  title: string;
  type: TaskType;
  notes?: string;
  time?: Date;

  due_date: Date;
  days_selected?: Weekday[]; // For routine tasks
  start_date?: Date; // For routine tasks
  end_date?: Date;   // For routine tasks

  recurrence_interval?: number; // For long interval tasks
  parent_task_id?: string; // For related tasks
}

// Format a Date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toLocalTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function combineAsDate(
  datePart: Date,
  timePart: Date
): Date {
  const combined = new Date(datePart);

  combined.setHours(
    timePart.getHours(),
    timePart.getMinutes(),
    timePart.getSeconds(),
    0
  );

  return combined;
}

export interface UpdateTaskParams {
  title?: string;
  type?: TaskType;
  due_date?: Date;
  time?:Date;
  completed?: boolean;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
  days_selected?: Weekday[];
  recurrence_interval?: number;
}

