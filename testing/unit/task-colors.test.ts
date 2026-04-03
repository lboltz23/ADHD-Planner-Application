import {
  colorBlindColors,
  colorBlindFilterColors,
  createTaskColors,
  defaultColors,
  defaultFilterColors,
  getEnhancedTaskTypeColor,
  getFilterColor,
  getTaskTypeColor,
} from '../../src/components/taskColors';

describe('task color helpers', () => {
  test('returns default task colors when color blind mode is off', () => {
    expect(getTaskTypeColor('routine', false)).toBe(defaultColors.routine);
    expect(getTaskTypeColor('basic', false)).toBe(defaultColors.basic);
  });

  test('returns color blind task colors when color blind mode is on', () => {
    expect(getTaskTypeColor('related', true)).toBe(colorBlindColors.related);
    expect(getTaskTypeColor('long_interval', true)).toBe(
      colorBlindColors.long_interval
    );
  });

  test('returns enhanced colors for task creation flow', () => {
    expect(getEnhancedTaskTypeColor('routine', false)).toBe(
      createTaskColors.routine
    );
    expect(getEnhancedTaskTypeColor('basic', true)).toBe(colorBlindColors.basic);
  });

  test('returns filter colors for both palettes', () => {
    expect(getFilterColor('today', false)).toBe(defaultFilterColors.today);
    expect(getFilterColor('open', true)).toBe(colorBlindFilterColors.open);
  });
});
