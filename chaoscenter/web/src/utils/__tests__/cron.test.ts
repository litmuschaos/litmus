import { getBreakdownValues } from '../cron';

// Same conversion as getMilitaryHours in components/SchedulePanel/SubComponents/utils.tsx,
// which turns the form's 12-hour value back into the cron hour when the schedule is saved.
const toCronHour = (hours: string, amPm: string): string => {
  const hoursInt = parseInt(hours);
  if (hoursInt === 12) return amPm === 'AM' ? '0' : '12';
  return amPm === 'AM' ? `${hoursInt}` : `${hoursInt + 12}`;
};

describe('getBreakdownValues', () => {
  test('splits an afternoon cron hour into 12-hour time', () => {
    expect(getBreakdownValues('30 14 * * *')).toMatchObject({ minutes: '30', hours: '2', amPm: 'PM' });
  });

  test('treats hour 12 as noon (PM) and hour 0 as midnight (12 AM)', () => {
    expect(getBreakdownValues('0 12 * * *')).toMatchObject({ hours: '12', amPm: 'PM' });
    expect(getBreakdownValues('0 0 * * *')).toMatchObject({ hours: '12', amPm: 'AM' });
  });

  test('keeps morning hours as they are', () => {
    expect(getBreakdownValues('15 9 * * MON,FRI')).toMatchObject({
      hours: '9',
      amPm: 'AM',
      dayOfWeek: ['MON', 'FRI']
    });
  });

  test('keeps the step of an hourly expression', () => {
    expect(getBreakdownValues('0 */3 * * *')).toMatchObject({ hours: '3' });
  });

  test('saving the loaded values gives back the original hour for every hour of the day', () => {
    for (let hour = 0; hour < 24; hour++) {
      const { hours, amPm } = getBreakdownValues(`0 ${hour} * * *`);
      expect(toCronHour(hours as string, amPm as string)).toBe(`${hour}`);
    }
  });
});
