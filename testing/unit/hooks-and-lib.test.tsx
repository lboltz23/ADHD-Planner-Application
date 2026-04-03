import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

const mockUseApp = jest.fn();
const mockUseScheme = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('../../src/contexts/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

jest.mock('../../src/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseScheme(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

describe('hooks and lib utilities', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue({
      settings: {
        defaultTimerMinutes: 25,
        soundEnabled: true,
        confettiEnabled: true,
        theme: 'auto',
        defaultTaskView: 'all',
        colorBlindMode: false,
      },
    });
    mockUseScheme.mockReturnValue('dark');
  });

  test('useAppTheme resolves theme and colors from app settings', () => {
    const { useAppTheme } = require('../../src/hooks/use-app-theme');

    function Probe() {
      const theme = useAppTheme();
      return (
        <Text>
          {`${theme.resolvedTheme}|${theme.isDark}|${theme.colors.background}`}
        </Text>
      );
    }

    const { getByText } = render(<Probe />);
    expect(getByText(/dark\|true\|/)).toBeTruthy();
  });

  test('useThemeColor prefers explicit prop color over palette color', () => {
    const { useThemeColor } = require('../../src/hooks/use-theme-color');

    function Probe() {
      const explicit = useThemeColor({ dark: '#101010' }, 'text');
      const fallback = useThemeColor({}, 'background');
      return <Text>{`${explicit}|${fallback}`}</Text>;
    }

    const { getByText } = render(<Probe />);
    expect(getByText(/#101010\|/)).toBeTruthy();
  });

  test('web useColorScheme resolves to system scheme after hydration', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
    const { useColorScheme } = require('../../src/hooks/use-color-scheme.web');

    function Probe() {
      const scheme = useColorScheme();
      return <Text>{scheme}</Text>;
    }

    const { getByText } = render(<Probe />);
    expect(getByText('dark')).toBeTruthy();
  });

  test('supabase client is created from env vars', () => {
    const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    jest.isolateModules(() => {
      require('../../lib/supabaseClient');
    });

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key'
    );

    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });
});
