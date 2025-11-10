import { Task } from "../App";

export interface TaskColorScheme {
  routine: string;
  basic: string;
  related: string;
}

// Default pastel color scheme
export const defaultColors: TaskColorScheme = {
  routine: "#b8a4d9", // Lavender
  basic: "#a8d8ea",   // Blue
  related: "#ffc9d4", // Pink
};

// Color blind friendly scheme with high contrast
export const colorBlindColors: TaskColorScheme = {
  routine: "#0077bb", // Blue (deuteranopia safe)
  basic: "#ee7733",   // Orange (protanopia safe)
  related: "#009988", // Teal (tritanopia safe)
};

export function getTaskTypeColor(type: Task["type"], colorBlindMode: boolean): string {
  const colors = colorBlindMode ? colorBlindColors : defaultColors;
  return colors[type];
}
