// src/types.ts
export type TaskType = "routine" | "basic" | "related" | "long_interval";

export interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  type: TaskType;
  time?: string;
}

