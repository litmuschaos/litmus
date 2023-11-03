import { split } from 'lodash-es';

export enum DaysOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN'
}
export interface ExpressionBreakdownInterface {
  minutes?: string;
  hours?: string;
  amPm?: string;
  dayOfMonth?: string;
  month?: string;
  startMonth?: string;
  dayOfWeek?: DaysOfWeek[] | string[];
  expression?: string;
}

export const getBreakdownValues = (cronExpression: string): ExpressionBreakdownInterface => {
  const cronExpressionArr = cronExpression?.trim().split(' ');
  const minArr = split(cronExpressionArr[0], '/');
  const hourArr = split(cronExpressionArr[1], '/');
  const monthArr = split(cronExpressionArr[3], '/');
  return {
    minutes: minArr.length > 1 ? minArr[1] : minArr[0],
    hours: hourArr.length > 1 ? hourArr[1] : hourArr[0],
    amPm: parseInt(cronExpressionArr[1]) <= 12 ? 'AM' : 'PM',
    dayOfMonth: cronExpressionArr[2],
    month: monthArr.length > 1 ? monthArr[1] : monthArr[0],
    startMonth: monthArr.length > 1 ? monthArr[0] : '*',
    dayOfWeek: cronExpressionArr[4] !== '*' ? cronExpressionArr[4].split(',') : []
  };
};

export const getSelectedTab = (cronExpression: string): string => {
  const cronExpressionArr = cronExpression?.trim().split(' ');

  if (
    cronExpressionArr[0] !== '*' &&
    cronExpressionArr[1] === '*' &&
    cronExpressionArr[2] === '*' &&
    cronExpressionArr[3] === '*' &&
    cronExpressionArr[4] === '*'
  )
    return 'Minutes';
  else if (
    cronExpressionArr[0] !== '*' &&
    cronExpressionArr[1] !== '*' &&
    cronExpressionArr[2] === '*' &&
    cronExpressionArr[3] === '*' &&
    cronExpressionArr[4] === '*'
  ) {
    if (cronExpressionArr[1].split('/').length > 1) return 'Hourly';
    else return 'Daily';
  } else if (
    cronExpressionArr[0] !== '*' &&
    cronExpressionArr[1] !== '*' &&
    cronExpressionArr[2] === '*' &&
    cronExpressionArr[3] === '*' &&
    cronExpressionArr[4].length > 0
  )
    return 'Weekly';
  else if (
    cronExpressionArr[0] !== '*' &&
    cronExpressionArr[1] !== '*' &&
    cronExpressionArr[2] !== '*' &&
    cronExpressionArr[3] !== '*' &&
    cronExpressionArr[4] === '*'
  ) {
    if (cronExpressionArr[3].split('/').length > 1) return 'Monthly';
    else return 'Yearly';
  } else return 'Minutes';
};
