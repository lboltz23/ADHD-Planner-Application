import React from 'react';
import { act, render } from '@testing-library/react-native';
import { DotLoader } from '../../src/components/DotLoader';

describe('DotLoader', () => {
  test('cycles dot count over time', () => {
    jest.useFakeTimers();
    const { getByText } = render(<DotLoader />);

    expect(getByText('.')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('..')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('...')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('.')).toBeTruthy();

    jest.useRealTimers();
  });
});
