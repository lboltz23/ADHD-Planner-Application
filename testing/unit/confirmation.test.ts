import { Alert } from 'react-native';
import { confirm } from '../../src/components/Confirmation';

describe('confirm', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('resolves true when user confirms', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons) => {
      const yesButton = (buttons as Array<{ text: string; onPress?: () => void }>)
        .find((button) => button.text === 'Yes');
      yesButton?.onPress?.();
    });

    await expect(confirm('Delete this task?')).resolves.toBe(true);
  });

  test('resolves false when user cancels', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons) => {
      const noButton = (buttons as Array<{ text: string; onPress?: () => void }>)
        .find((button) => button.text === 'No');
      noButton?.onPress?.();
    });

    await expect(confirm('Keep this task?')).resolves.toBe(false);
  });
});
