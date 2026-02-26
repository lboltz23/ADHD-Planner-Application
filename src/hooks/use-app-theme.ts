import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  AppThemeColors,
  resolveThemePreference,
  type ResolvedTheme,
} from '../constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useAppTheme() {
  const { settings } = useApp();
  const systemScheme = useColorScheme();
  const resolvedTheme: ResolvedTheme = resolveThemePreference(
    settings.theme,
    systemScheme
  );
  const isDark = resolvedTheme === 'dark';
  const colors = useMemo(() => AppThemeColors[resolvedTheme], [resolvedTheme]);

  return {
    colors,
    isDark,
    resolvedTheme,
  };
}
