import React from 'react';
import { Layout, Tabs, Tab, Text } from '@harnessio/uicore';
import cx from 'classnames';
import { useStrings } from '@strings';
import { getDefaultExpressionBreakdownValues, scheduleTabsId } from './SubComponents/utils';
import MinutesTab from './SubComponents/MinutesTab/MinutesTab';
import HourlyTab from './SubComponents/HourlyTab/HourlyTab';
import DailyTab from './SubComponents/DailyTab/DailyTab';
import WeeklyTab from './SubComponents/WeeklyTab/WeeklyTab';
import MonthlyTab from './SubComponents/MonthlyTab/MonthlyTab';
import YearlyTab from './SubComponents/YearlyTab/YearlyTab';
import CustomTab from './SubComponents/CustomTab/CustomTab';
import css from './SchedulePanel.module.scss';

export interface SchedulePanelPropsInterface {
  formikProps?: any;
  /**
   * Renders only the custom tab in panel
   */
  isEdit?: boolean;
  /**
   * Render the form Title above tabs panel container
   */
  renderFormTitle?: boolean;
  hideSeconds: boolean;
}

const SchedulePanel: React.FC<SchedulePanelPropsInterface> = ({
  formikProps: {
    values: { selectedScheduleTab },
    values
  },
  formikProps,
  isEdit = false,
  renderFormTitle = true,
  hideSeconds
}): JSX.Element => {
  const { getString } = useStrings();

  return (
    <Layout.Vertical className={cx(css.schedulePanelContainer)} spacing="large">
      {renderFormTitle && (
        <Text className={css.formContentTitle} inline={true}>
          {getString('schedule')}
        </Text>
      )}
      <Layout.Vertical className={css.formContent}>
        <Tabs
          id="Wizard"
          onChange={(val: string) => {
            const newDefaultValues = selectedScheduleTab !== val ? getDefaultExpressionBreakdownValues(val) : {};
            formikProps.setValues({ ...values, ...newDefaultValues, selectedScheduleTab: val });
          }}
          defaultSelectedTabId={selectedScheduleTab}
        >
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MINUTES}
              title={getString('minutesLabel')}
              panel={<MinutesTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.HOURLY}
              title={getString('hourly')}
              panel={<HourlyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.DAILY}
              title={getString('daily')}
              panel={<DailyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.WEEKLY}
              title={getString('weekly')}
              panel={<WeeklyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MONTHLY}
              title={getString('monthly')}
              panel={<MonthlyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.YEARLY}
              title={getString('yearlyTabTitle')}
              panel={<YearlyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          <Tab
            id={scheduleTabsId.CUSTOM}
            title={getString('customLabel')}
            panel={<CustomTab formikProps={formikProps} hideSeconds={hideSeconds} />}
          />
        </Tabs>
      </Layout.Vertical>
    </Layout.Vertical>
  );
};
export default SchedulePanel;
