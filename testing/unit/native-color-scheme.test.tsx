import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

describe('native use-color-scheme hook', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('re-exports react-native useColorScheme', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    const { useColorScheme } = require('../../src/hooks/use-color-scheme');

    function Probe() {
      const scheme = useColorScheme();
      return <Text>{scheme}</Text>;
    }

    const { getByText } = render(<Probe />);
    expect(getByText('light')).toBeTruthy();
  });
});
