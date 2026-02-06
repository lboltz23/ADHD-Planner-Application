// src/types.ts
export type TaskType = "routine" | "basic" | "related" | "long_interval";

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  type: TaskType;
  due_date: Date;
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
}

export interface CreateTaskParams {
  title: string;
  type: TaskType;
  notes?: string;

  due_date: Date;
  days_selected?: Weekday[]; // For routine tasks
  start_date?: Date; // For routine tasks
  end_date?: Date;   // For routine tasks

  recurrence_interval?: number; // For long interval tasks

}

export interface UpdateTaskParams {
  title?: string;
  type?: TaskType;
  due_date?: Date;
  completed?: boolean;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
  days_selected?: Weekday[];
  recurrence_interval?: number;
}

