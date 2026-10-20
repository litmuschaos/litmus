import { getDurationBetweenTwoDates } from '../dates';

describe('getDurationBetweenTwoDates', () => {
  test('shows both years when the day and month match across different years', () => {
    const startTime = new Date(2025, 0, 1, 9).getTime();
    const endTime = new Date(2026, 0, 1, 10).getTime();

    expect(getDurationBetweenTwoDates(startTime, endTime)).toBe('1 Jan 2025 - 1 Jan 2026');
  });

  test('shows the start and end times for the same calendar day', () => {
    const startTime = new Date(2026, 0, 1, 9).getTime();
    const endTime = new Date(2026, 0, 1, 10).getTime();

    expect(getDurationBetweenTwoDates(startTime, endTime)).toBe('1 Jan 2026, 09:00 - 10:00');
  });

  test('shows both dates for different days in the same year', () => {
    const startTime = new Date(2026, 0, 1, 9).getTime();
    const endTime = new Date(2026, 0, 2, 10).getTime();

    expect(getDurationBetweenTwoDates(startTime, endTime)).toBe('1 Jan 2026 - 2 Jan 2026');
  });

  test('shows an unfinished range when the end time is missing', () => {
    const startTime = new Date(2026, 0, 1, 9).getTime();

    expect(getDurationBetweenTwoDates(startTime, undefined)).toBe('1 Jan 2026, 09:00 - --');
  });

  test('shows a placeholder when both timestamps are missing', () => {
    expect(getDurationBetweenTwoDates(undefined, undefined)).toBe('-');
  });
});
