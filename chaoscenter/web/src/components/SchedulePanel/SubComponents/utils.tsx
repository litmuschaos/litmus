import type { SelectOption } from '@harnessio/uicore';
import { isValidCron } from 'cron-validator';
import { amPmOptions, oneTwelveDDOptions, zeroFiftyNineDDOptions } from '@utils';
const cronSensicalMinutes = [5, 10, 15, 20, 30];
const cronSensicalHours = [1, 2, 3, 4, 6, 8, 12];
export const cronSensicalMinutesOptions = cronSensicalMinutes.map(i => ({ label: `${i}`, value: `${i}` }));
export const cronSensicalHoursOptions = cronSensicalHours.map(i => ({ label: `${i}`, value: `${i}` }));
export const zeroFiftyNineOptions = Array.from({ length: 60 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
export const oneFiftyNineOptions = zeroFiftyNineOptions.slice(1);
export const zeroTwentyThreeOptions = Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
export const zeroThirtyOneOptions = Array.from({ length: 32 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
export const oneThirtyOneOptions = zeroThirtyOneOptions.slice(1);
export const oneFiftyNineDDOptions = zeroFiftyNineDDOptions.slice(1);
export const oneTwelveOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));
const getPostPosition = (i: number): string => {
  if (i == 1 || i == 21 || i == 31) {
    return 'st';
  } else if (i == 2 || i == 22) {
    return 'nd';
  } else if (i == 3 || i == 23) {
    return 'rd';
  } else {
    return 'th';
  }
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const daysInMonth: { [key: string]: number } = {
  '1': 31,
  '2': 29, // allow lead year
  '3': 31,
  '4': 30,
  '5': 31,
  '6': 30,
  '7': 31,
  '8': 31,
  '9': 30,
  '10': 31,
  '11': 30,
  '12': 31
};

export const getDayOptionsToMonth = ({
  monthNo,
  options
}: {
  monthNo: string;
  options: SelectOption[];
}): SelectOption[] => options.slice(0, daysInMonth[monthNo]);

export const monthOptions = months.map((month, index) => ({ label: month, value: (index + 1).toString() }));

export const nthDayOptions = Array.from({ length: 31 }, (_, i) => {
  const value = i + 1;
  const label = `${value}${getPostPosition(value)} Day`;

  return { label, value: `${value}` };
});

export enum DaysOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN'
}
export const shortDays: DaysOfWeek[] = [
  DaysOfWeek.MON,
  DaysOfWeek.TUE,
  DaysOfWeek.WED,
  DaysOfWeek.THU,
  DaysOfWeek.FRI,
  DaysOfWeek.SAT,
  DaysOfWeek.SUN
];

export const defaultScheduleValues = {
  MINUTES_0: oneFiftyNineOptions[0].value,
  MINUTES_5: cronSensicalMinutesOptions[0].value,
  MINUTES_00: zeroFiftyNineDDOptions[0].value,
  DAY_OF_MONTH_1: oneThirtyOneOptions[0].value,
  HOURS_1: oneTwelveOptions[0].value,
  HOURS_01: oneTwelveDDOptions[0].value,
  MINUTES_1: oneFiftyNineOptions[0].value,
  AM_PM: amPmOptions[0].value,
  DAY_OF_MONTH_1ST: nthDayOptions[0].value,
  DAYS_OF_WEEK: [DaysOfWeek.MON],
  DAY_OF_WEEK_EMPTY: [],
  MONTH_1: oneTwelveOptions[0].value,
  JANUARY: monthOptions[0].value,
  MON: [DaysOfWeek.MON],
  ASTERISK: '*'
};

export const scheduleTabsId = {
  MINUTES: 'Minutes',
  HOURLY: 'Hourly',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom'
};

export const resetScheduleObject = {
  minutes: undefined,
  hours: undefined,
  dayOfMonth: undefined,
  month: undefined,
  dayOfWeek: undefined
};

export enum EXP_BREAKDOWN_INPUTS {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAY_OF_MONTH = 'DAY_OF_MONTH',
  MONTH = 'MONTH',
  DAY_OF_WEEK = 'DAY_OF_WEEK'
}

export interface ExpressionBreakdownInterface {
  minutes?: string;
  hours?: string;
  amPm?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: DaysOfWeek[] | string[];
  expression?: string;
}

export interface DefaultExpressionBreakdownInterface {
  minutes?: string;
  hours?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: DaysOfWeek[] | string[];
  expression?: string;
}

const defaultTimeSelect = {
  hours: defaultScheduleValues.HOURS_01,
  minutes: defaultScheduleValues.MINUTES_00,
  amPm: defaultScheduleValues.AM_PM
};
const defaultMinutesValues = {
  minutes: defaultScheduleValues.MINUTES_5,
  hours: defaultScheduleValues.ASTERISK,
  amPm: defaultScheduleValues.AM_PM,
  dayOfMonth: defaultScheduleValues.ASTERISK,
  month: defaultScheduleValues.ASTERISK,
  dayOfWeek: defaultScheduleValues.DAY_OF_WEEK_EMPTY
};

const defaultHourlyValues = {
  minutes: defaultScheduleValues.MINUTES_00,
  hours: defaultScheduleValues.HOURS_1,
  amPm: defaultScheduleValues.AM_PM,
  dayOfMonth: defaultScheduleValues.ASTERISK,
  month: defaultScheduleValues.ASTERISK,
  dayOfWeek: defaultScheduleValues.DAY_OF_WEEK_EMPTY
};

export const defaultDailyValues = {
  dayOfMonth: defaultScheduleValues.ASTERISK,
  month: defaultScheduleValues.ASTERISK,
  dayOfWeek: defaultScheduleValues.DAY_OF_WEEK_EMPTY,
  ...defaultTimeSelect
};

export const defaultWeeklyValues = {
  dayOfMonth: defaultScheduleValues.ASTERISK,
  month: defaultScheduleValues.ASTERISK,
  dayOfWeek: defaultScheduleValues.MON,
  ...defaultTimeSelect
};

export const defaultMonthlyValues = {
  dayOfMonth: defaultScheduleValues.DAY_OF_MONTH_1ST,
  startMonth: defaultScheduleValues.JANUARY,
  month: defaultScheduleValues.MONTH_1,
  dayOfWeek: defaultScheduleValues.DAY_OF_WEEK_EMPTY,
  ...defaultTimeSelect
};

export const defaultYearlyValues = {
  dayOfMonth: defaultScheduleValues.DAY_OF_MONTH_1ST,
  month: defaultScheduleValues.JANUARY,
  dayOfWeek: defaultScheduleValues.DAY_OF_WEEK_EMPTY,
  ...defaultTimeSelect
};

export const getSlashValue = ({
  selectedScheduleTab,
  id,
  value,
  startMonth
}: {
  selectedScheduleTab: string;
  id: string;
  value: string;
  startMonth?: string;
}): string => {
  if (selectedScheduleTab === scheduleTabsId.MINUTES && id === 'minutes') {
    return `0/${value}`;
  } else if (selectedScheduleTab === scheduleTabsId.HOURLY && id === 'hours') {
    return `0/${value}`;
  } else if (selectedScheduleTab === scheduleTabsId.MONTHLY && id === 'month' && startMonth) {
    // cron expression: startMonth / monthInterval
    return `${startMonth}/${value}`;
  }
  return value;
};

export const getDayOfWeekStr = (days?: string[]): string =>
  days?.length ? shortDays.filter(day => days.includes(day)).join(',') : '*';

export const getDefaultExpressionBreakdownValues = (tabId: string): DefaultExpressionBreakdownInterface => {
  if (tabId === scheduleTabsId.CUSTOM) {
    // persist expression from formik values
    return { ...resetScheduleObject };
  } else if (tabId === scheduleTabsId.MINUTES) {
    const { minutes, hours, dayOfMonth, month, dayOfWeek } = defaultMinutesValues;
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${getSlashValue({
            selectedScheduleTab: tabId,
            id: 'minutes',
            value: minutes
          })} ${hours} ${dayOfMonth} ${month} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultMinutesValues,
      expression: constructedExpression
    };
  } else if (tabId === scheduleTabsId.HOURLY) {
    const { minutes, hours, dayOfMonth, month, dayOfWeek } = defaultHourlyValues;
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${minutes} ${getSlashValue({
            selectedScheduleTab: tabId,
            id: 'hours',
            value: hours
          })} ${dayOfMonth} ${month} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultHourlyValues,
      expression: constructedExpression
    };
  } else if (tabId === scheduleTabsId.DAILY) {
    const { minutes, hours, dayOfMonth, month, dayOfWeek } = defaultDailyValues;
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${minutes} ${hours} ${getSlashValue({
            selectedScheduleTab: tabId,
            id: 'dayOfMonth',
            value: dayOfMonth
          })} ${month} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultDailyValues,
      expression: constructedExpression
    };
  } else if (tabId === scheduleTabsId.WEEKLY) {
    const { minutes, hours, dayOfMonth, month, dayOfWeek } = defaultWeeklyValues;
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${minutes} ${hours} ${dayOfMonth} ${month} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultWeeklyValues,
      expression: constructedExpression
    };
  } else if (tabId === scheduleTabsId.MONTHLY) {
    const { minutes, hours, dayOfMonth, month, startMonth, dayOfWeek } = defaultMonthlyValues;
    // startMonth only applicable for Monthly tab, handled in getSlashValue
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${minutes} ${hours} ${dayOfMonth} ${getSlashValue({
            selectedScheduleTab: tabId,
            id: 'month',
            startMonth,
            value: month
          })} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultMonthlyValues,
      expression: constructedExpression
    };
  } else if (tabId === scheduleTabsId.YEARLY) {
    const { minutes, hours, dayOfMonth, month, dayOfWeek } = defaultYearlyValues;
    const constructedExpression =
      tabId !== scheduleTabsId.CUSTOM
        ? `${minutes} ${hours} ${dayOfMonth} ${month} ${getDayOfWeekStr(dayOfWeek)}`
        : undefined;
    return {
      ...defaultYearlyValues,
      expression: constructedExpression
    };
  }
  return {};
};

const getExpressionBreakdownIndexes = (id: string): number => {
  if (id === 'minutes') return 0;
  else if (id === 'hours') return 1;
  else if (id === 'dayOfMonth') return 2;
  else if (id === 'month') return 3;
  else if (id === 'dayOfWeek') return 4;
  return -1;
};

export const getUpdatedExpression = ({
  expression,
  id,
  value
}: {
  expression: string;
  id: string;
  value: string;
}): string => {
  const breakdownIndex = getExpressionBreakdownIndexes(id);
  const updatedExpressionArr: string[] = expression.split(' ');
  updatedExpressionArr[breakdownIndex] = value;

  return updatedExpressionArr?.join(' ');
};

export const AmPmMap = {
  AM: 'AM',
  PM: 'PM'
};

export const getMilitaryHours = ({ hours, amPm }: { hours: string; amPm: string }): string => {
  if (hours === '*') return '*';
  const hoursInt = parseInt(hours);
  if (hoursInt === 12 && amPm === AmPmMap.AM) {
    return '0';
  } else if (hoursInt === 12 && amPm === AmPmMap.PM) {
    return '12';
  }

  return amPm === AmPmMap.AM ? hoursInt.toString() : (hoursInt + 12).toString();
};

export const getBreakdownValues = (cronExpression: string): ExpressionBreakdownInterface => {
  const cronExpressionArr = cronExpression?.trim().split(' ');
  return {
    minutes: cronExpressionArr[0],
    hours: cronExpressionArr[1],
    dayOfMonth: cronExpressionArr[2],
    month: cronExpressionArr[3],
    dayOfWeek: Array.isArray(cronExpressionArr[4]) ? cronExpressionArr[4].split(',') : []
  };
};

export const isCronValid = (expression: string): boolean => isValidCron(expression, { alias: true });
