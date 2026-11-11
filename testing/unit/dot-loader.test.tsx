import React from 'react';
import { act, render } from '@testing-library/react-native';
import { DotLoader } from '../../src/components/DotLoader';

describe('DotLoader', () => {
  test('cycles dot count over time', async () => {
    jest.useFakeTimers();
    const { getByText } = await render(<DotLoader />);

    expect(getByText('.')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('..')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('...')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(getByText('.')).toBeTruthy();

    jest.useRealTimers();
  });
});
