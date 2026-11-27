import { getDurationBetweenTwoDates, timeDifferenceForDate } from '../dates';

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

describe('timeDifferenceForDate', () => {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const ago = (ms: number): string => timeDifferenceForDate(Date.now() - ms);

  test('uses the next unit when the rounded value reaches it', () => {
    expect(ago(59.7 * minute)).toBe('1 hour ago');
    expect(ago(23.7 * hour)).toBe('1 day ago');
    expect(ago(29.7 * day)).toBe('1 month ago');
    expect(ago(355 * day)).toBe('1 year ago');
  });

  test('uses the singular for a count of 1 and the plural otherwise', () => {
    expect(ago(1.2 * minute)).toBe('1 min ago');
    expect(ago(5 * minute)).toBe('5 mins ago');
    expect(ago(3 * hour)).toBe('3 hours ago');
    expect(ago(2 * day)).toBe('2 days ago');
  });

  test('keeps the labels for recent and missing dates', () => {
    expect(ago(5 * 1000)).toBe('Just now');
    expect(ago(30 * 1000)).toBe('less than 1 min ago');
    expect(timeDifferenceForDate(0)).toBe('-');
  });
});
