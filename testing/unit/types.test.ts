import { toLocalDateString } from '../../src/types';

describe('toLocalDateString', () => {
  test('formats single digit month/day with padding', () => {
    const date = new Date(2026, 0, 5);
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });

  test('formats double digit month/day correctly', () => {
    const date = new Date(2026, 10, 15);
    expect(toLocalDateString(date)).toBe('2026-11-15');
  });
});
