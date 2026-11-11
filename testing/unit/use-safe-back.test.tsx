import React, { useEffect } from 'react';
import { act, render } from '@testing-library/react-native';
import { useSafeBack } from '../../src/hooks/use-Safe-Back';

const mockCanGoBack = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    canGoBack: mockCanGoBack,
    back: mockBack,
    replace: mockReplace,
  }),
}));

function HookHarness({ onReady }: { onReady: (handler: () => void) => void }) {
  const safeBack = useSafeBack();

  useEffect(() => {
    onReady(safeBack);
  }, [onReady, safeBack]);

  return null;
}

describe('useSafeBack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('goes back when navigation stack has a previous route', async () => {
    mockCanGoBack.mockReturnValue(true);
    let handler = () => {};

    await render(<HookHarness onReady={(fn) => (handler = fn)} />);

    await act(async () => handler());

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('replaces with root route when there is no previous route', async () => {
    mockCanGoBack.mockReturnValue(false);
    let handler = () => {};

    await render(<HookHarness onReady={(fn) => (handler = fn)} />);

    await act(async () => handler());

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
