import {
  AppColors,
  AppThemeColors,
  resolveThemePreference,
} from '../../src/constants/theme';

describe('theme utilities', () => {
  test('resolves explicit dark and light preferences', () => {
    expect(resolveThemePreference('dark', 'light')).toBe('dark');
    expect(resolveThemePreference('light', 'dark')).toBe('light');
  });

  test('resolves auto preference from system scheme', () => {
    expect(resolveThemePreference('auto', 'dark')).toBe('dark');
    expect(resolveThemePreference('auto', 'light')).toBe('light');
    expect(resolveThemePreference('auto', null)).toBe('light');
    expect(resolveThemePreference('auto', undefined)).toBe('light');
  });

  test('exposes expected app palette keys', () => {
    expect(AppThemeColors.light.background).toBeDefined();
    expect(AppThemeColors.dark.background).toBeDefined();
    expect(AppColors.primary).toBe('#6b5b7f');
  });
});
