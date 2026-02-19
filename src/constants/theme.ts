/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const AppThemeColors = {
  light: {
    background: '#f8f6fb',
    screen: '#ffffff',
    surface: '#ffffff',
    surfaceMuted: '#f2ecfa',
    inputBackground: '#f8f6fb',
    border: '#e5d9f2',
    text: '#333333',
    textMuted: '#999999',
    heading: '#6b5b7f',
    accent: '#b8a4d9',
    accentSoft: '#a8d8ea',
    success: '#b4e7ce',
    warning: '#ffd89b',
  },
  dark: {
    background: '#0f1118',
    screen: '#141826',
    surface: '#1b2133',
    surfaceMuted: '#242b42',
    inputBackground: '#202841',
    border: '#2e3856',
    text: '#e6e9f2',
    textMuted: '#9aa3bb',
    heading: '#d7c6f7',
    accent: '#8e77bf',
    accentSoft: '#6ea6c2',
    success: '#4f9b78',
    warning: '#b5935c',
  },
} as const;

export type ThemeColors = (typeof AppThemeColors)[keyof typeof AppThemeColors];

export function resolveThemePreference(
  preference: ThemePreference,
  systemScheme: string | null | undefined
): ResolvedTheme {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export const AppColors = {
  primary: "#6b5b7f",
  border: "#e5d9f2",
  inputBackground: "#f8f6fb",
  placeholder: "#999",
} as const;


export const  AppColorsColorBlind = {
  primary: "#3D3D3D",
  border: "#A0A0A0",
  inputBackground: "#F5F5F5",
  placeholder: "#757575",
} as const;

export function getAppColors(colorBlindMode: boolean) {
  return colorBlindMode ? AppColorsColorBlind : AppColors;
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
