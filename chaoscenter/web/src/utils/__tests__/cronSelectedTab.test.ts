import { getSelectedTab } from '../cron';

describe('getSelectedTab', () => {
  test.each([
    ['0/5 * * * *', 'Minutes'],
    ['0 0/2 * * *', 'Hourly'],
    ['30 14 * * *', 'Daily'],
    ['0 9 * * MON,WED,FRI', 'Weekly'],
    ['0 9 1 1/3 *', 'Monthly'],
    ['0 9 15 6 *', 'Yearly']
  ])('selects the tab that builds %s', (expression, tab) => {
    expect(getSelectedTab(expression)).toBe(tab);
  });

  test.each([
    ['0 0 1 * *'], // monthly on the 1st, written by hand
    ['30 * * * *'], // hourly at :30, not "every 30 minutes"
    ['* * * * *'],
    ['0 9 * * 1-5'], // numeric day range
    ['@daily'],
    ['0 0 * * * *'] // six fields
  ])('opens %s in the Custom tab', expression => {
    expect(getSelectedTab(expression)).toBe('Custom');
  });

  test('accepts extra spaces between fields', () => {
    expect(getSelectedTab(' 30  14 * * * ')).toBe('Daily');
  });
});
