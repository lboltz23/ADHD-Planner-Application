import { Task } from "../types";

export interface TaskColorScheme {
  routine: string;
  basic: string;
  related: string;
  long_interval: string;
}
export interface FilterColorScheme {
  today: string;
  upcoming: string;
  repeating: string;
  open: string;
}

export const defaultFilterColors: FilterColorScheme = {
  today: "#b8a4d9",
  upcoming: "#a8d8ea",
  repeating: "#f5a4e0ff",
  open: "#ffc9d4",
};

export const colorBlindFilterColors: FilterColorScheme = {
  today: "#0077BB", // Blue (deuteranopia safe)
  upcoming: "#EE7733",   // Orange (protanopia safe)
  repeating: "#009988", // Teal (tritanopia safe)
  open: "#EE3377", // Magenta (high contrast)
};

// Default pastel color scheme
export const defaultColors: TaskColorScheme = {
  routine: "#b8a4d9", // Lavender
  basic: "#a8d8ea",   // Blue
  related: "#ffc9d4", // Pink
  long_interval: "#f5a4e0ff", // Magenta
};

export const createTaskColors : TaskColorScheme = {
  routine: "#9a72db", // Lavender
  basic: "#76cae8",   // Blue
  related: "#fe859e", // Pink
  long_interval: "rgb(243, 102, 205)", // Magenta
}

// Color blind friendly scheme with high contrast
export const colorBlindColors: TaskColorScheme = {
  routine: "#0077BB", // Blue (deuteranopia safe)
  basic: "#EE7733",   // Orange (protanopia safe)
  related: "#009988", // Teal (tritanopia safe)
  long_interval: "#EE3377", // Magenta
};

export function getTaskTypeColor(type: Task["type"], colorBlindMode: boolean): string {
  const colors = colorBlindMode ? colorBlindColors : defaultColors;
  return colors[type];
}

export function getEnhancedTaskTypeColor(type: Task["type"], colorBlindMode: boolean): string {
  const colors = colorBlindMode ? colorBlindColors : createTaskColors;
  return colors[type];
}

export type FilterType = keyof FilterColorScheme;

export function getFilterColor(filter: FilterType, colorBlindMode: boolean): string {
  const colors = colorBlindMode ? colorBlindFilterColors : defaultFilterColors;
  return colors[filter];
}