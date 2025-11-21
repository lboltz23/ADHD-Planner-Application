import { Task } from "../App";

export interface TaskColorScheme {
  routine: string;
  basic: string;
  related: string;
  long_interval: string;
}

// Default pastel color scheme
export const defaultColors: TaskColorScheme = {
  routine: "#b8a4d9", // Lavender
  basic: "#a8d8ea",   // Blue
  related: "#ffc9d4", // Pink
  long_interval: "#f5a4e0ff", // Magenta
};

// Color blind friendly scheme with high contrast
export const colorBlindColors: TaskColorScheme = {
  routine: "#0077BB", // Blue (deuteranopia safe)
  basic: "#EE7733",   // Orange (protanopia safe)
  related: "#009988", // Teal (tritanopia safe)
  long_interval: "#CC3311", // 
};

export function getTaskTypeColor(type: Task["type"], colorBlindMode: boolean): string {
  const colors = colorBlindMode ? colorBlindColors : defaultColors;
  return colors[type];
}
