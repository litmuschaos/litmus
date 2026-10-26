import React from 'react';
import { Layout, Container, Text } from '@harnessio/uicore';
import { isUndefined } from 'lodash-es';
import cx from 'classnames';
import { StringKeys, useStrings } from '@strings';
import { EXP_BREAKDOWN_INPUTS, scheduleTabsId, getMilitaryHours, getSlashValue, getDayOfWeekStr } from '../utils';
import css from './ExpressionBreakdown.module.scss';

interface ExpressionBreakdownPropsInterface {
  formikValues?: any;
  activeInputs: EXP_BREAKDOWN_INPUTS[];
}

export const ActiveInputs = {
  MINUTES: EXP_BREAKDOWN_INPUTS.MINUTES,
  HOURS: EXP_BREAKDOWN_INPUTS.HOURS,
  DAY_OF_MONTH: EXP_BREAKDOWN_INPUTS.DAY_OF_MONTH,
  MONTH: EXP_BREAKDOWN_INPUTS.MONTH,
  DAY_OF_WEEK: EXP_BREAKDOWN_INPUTS.DAY_OF_WEEK
};
const ColumnWidth = {
  SMALL: 100,
  MEDIUM: 125,
  LARGE: 250
};
interface ColumnInterface {
  width: number;
  inactive: boolean;
  label: string;
  value?: string;
  getString: (key: StringKeys) => string;
  hideValuesRow: boolean;
}

const getColumnValue = (formikValues: any, column: EXP_BREAKDOWN_INPUTS): string | undefined => {
  const { minutes, hours, amPm, dayOfMonth, month, startMonth, dayOfWeek, selectedScheduleTab, expression } =
    formikValues;

  const isCustomTab = selectedScheduleTab === scheduleTabsId.CUSTOM;

  const expressionArr = expression?.trim() && isCustomTab ? expression.trim().split(' ') : undefined;
  if (expressionArr?.length > 5) {
    expressionArr.shift(); // Remove the seconds part
  }
  if (column === EXP_BREAKDOWN_INPUTS.MINUTES) {
    return isCustomTab ? expressionArr?.[0] : getSlashValue({ selectedScheduleTab, id: 'minutes', value: minutes });
  } else if (column === EXP_BREAKDOWN_INPUTS.HOURS) {
    if (isCustomTab) return expressionArr?.[1];
    else if (selectedScheduleTab === scheduleTabsId.HOURLY) {
      return getSlashValue({ selectedScheduleTab, id: 'hours', value: hours });
    }
    return getMilitaryHours({ hours, amPm });
  } else if (column === EXP_BREAKDOWN_INPUTS.DAY_OF_MONTH) {
    return isCustomTab
      ? expressionArr?.[2]
      : getSlashValue({ selectedScheduleTab, id: 'dayOfMonth', value: dayOfMonth });
  } else if (column === EXP_BREAKDOWN_INPUTS.MONTH) {
    return isCustomTab
      ? expressionArr?.[3]
      : getSlashValue({ selectedScheduleTab, id: 'month', startMonth, value: month });
  } else if (column === EXP_BREAKDOWN_INPUTS.DAY_OF_WEEK) {
    return isCustomTab ? expressionArr?.[4] : getDayOfWeekStr(dayOfWeek);
  }
  return undefined;
};

const Column = ({ width, inactive, label, value, getString, hideValuesRow }: ColumnInterface): JSX.Element => {
  return (
    <Layout.Vertical width={width} data-name="column" className={css.column}>
      <Container className={css.label}>
        <Text>{label}</Text>
      </Container>
      {!hideValuesRow && (
        <Container className={cx(css.value, inactive && css.inactive)}>
          <Text>{(!isUndefined(value) && value) || getString('invalidText')}</Text>
        </Container>
      )}
    </Layout.Vertical>
  );
};

const ExpressionBreakdown: React.FC<ExpressionBreakdownPropsInterface> = ({
  formikValues,
  formikValues: { selectedScheduleTab },
  activeInputs
}): JSX.Element => {
  const { getString } = useStrings();
  const minutesValue = getColumnValue(formikValues, EXP_BREAKDOWN_INPUTS.MINUTES);
  const hideValuesRow = selectedScheduleTab === scheduleTabsId.CUSTOM && isUndefined(minutesValue);
  return (
    <Container data-name="expressionBreakdown" className={css.expressionBreakdown}>
      <Text className={css.title} data-tooltip-id="expressionBreakdown">
        {getString('expressionBreakdown')}
      </Text>
      <Layout.Horizontal>
        <Column
          width={ColumnWidth.SMALL}
          label={getString('minutesLabel')}
          value={minutesValue}
          inactive={!activeInputs.includes(ActiveInputs.MINUTES)}
          getString={getString}
          hideValuesRow={hideValuesRow}
        />
        <Column
          width={ColumnWidth.SMALL}
          label={getString('hoursLabel')}
          value={getColumnValue(formikValues, EXP_BREAKDOWN_INPUTS.HOURS)}
          inactive={!activeInputs.includes(ActiveInputs.HOURS)}
          getString={getString}
          hideValuesRow={hideValuesRow}
        />
        <Column
          width={ColumnWidth.MEDIUM}
          label={getString('dayOfMonthLabel')}
          value={getColumnValue(formikValues, EXP_BREAKDOWN_INPUTS.DAY_OF_MONTH)}
          inactive={!activeInputs.includes(ActiveInputs.DAY_OF_MONTH)}
          getString={getString}
          hideValuesRow={hideValuesRow}
        />
        <Column
          width={ColumnWidth.SMALL}
          label={getString('monthLabel')}
          value={getColumnValue(formikValues, EXP_BREAKDOWN_INPUTS.MONTH)}
          inactive={!activeInputs.includes(ActiveInputs.MONTH)}
          getString={getString}
          hideValuesRow={hideValuesRow}
        />
        <Column
          width={ColumnWidth.LARGE}
          label={getString('dayOfWeekLabel')}
          value={getColumnValue(formikValues, EXP_BREAKDOWN_INPUTS.DAY_OF_WEEK)}
          inactive={!activeInputs.includes(ActiveInputs.DAY_OF_WEEK)}
          getString={getString}
          hideValuesRow={hideValuesRow}
        />
      </Layout.Horizontal>
    </Container>
  );
};
export default ExpressionBreakdown;
