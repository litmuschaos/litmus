/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */

import { useQuery } from '@apollo/client';
import React from 'react';
import {
  LIST_DASHBOARD,
  LIST_DATASOURCE,
  SCHEDULE_DETAILS,
} from '../../../graphql/queries';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
} from '../../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../models/graphql/dataSourceDetails';
import {
  ScheduleDataVars,
  Schedules,
  ScheduleWorkflow,
} from '../../../models/graphql/scheduleData';
import { getProjectID } from '../../../utils/getSearchParams';
import { sortNumAsc } from '../../../utils/sort';
import { OverviewConfigureBanner } from './OverviewConfigureBanner';
import { OverviewGlowCard } from './OverviewGlowActionCard';
import { AnalyticsQuickActionCard } from './OverviewQuickActionCard';
import { AnalyticsScheduleWorkflowCard } from './OverviewScheduleBanner';
import useStyles from './styles';
import { TableDashboardData } from './Tables/dashboardData';
import { TableDataSource } from './Tables/dataSource';
import { TableScheduleWorkflow } from './Tables/worflowData';

const Overview: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();

  // Apollo query to get the scheduled data
  const { data: schedulesData } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: {
        projectID,
      },
      fetchPolicy: 'cache-and-network',
      pollInterval: 10000,
    }
  );

  const filteredScheduleData = schedulesData?.getScheduledWorkflows
    .slice()
    .sort((a: ScheduleWorkflow, b: ScheduleWorkflow) => {
      const x = parseInt(a.updated_at, 10);
      const y = parseInt(b.updated_at, 10);
      return sortNumAsc(y, x);
    });

  // Apollo query to get the dashboard data
  const { data: dashboardsList } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: {
        projectID,
      },
      fetchPolicy: 'cache-and-network',
      pollInterval: 10000,
    }
  );

  const filteredDashboardData = dashboardsList?.ListDashboard
    ? dashboardsList?.ListDashboard.slice().sort(
        (a: ListDashboardResponse, b: ListDashboardResponse) => {
          const x = parseInt(a.updated_at, 10);
          const y = parseInt(b.updated_at, 10);
          return sortNumAsc(y, x);
        }
      )
    : [];
  // Query for dataSource
  const { data } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
      pollInterval: 10000,
    }
  );
  // Filter data source data
  const filteredDataSourceData: ListDataSourceResponse[] = data
    ? data.ListDataSource.sort(
        (a: ListDataSourceResponse, b: ListDataSourceResponse) => {
          const x = parseInt(a.updated_at, 10);
          const y = parseInt(b.updated_at, 10);
          return sortNumAsc(y, x);
        }
      )
    : [];

  return (
    <div className={classes.root}>
      <div className={classes.overviewGraphs}>
        <div className={classes.leftBannerTable}>
          {(filteredDashboardData &&
            filteredDashboardData.length === 0 &&
            filteredDataSourceData.length === 0 && (
              <OverviewConfigureBanner variant="0" />
            )) ||
            (filteredDashboardData &&
              filteredDataSourceData.length > 0 &&
              filteredDashboardData.length === 0 && (
                <OverviewConfigureBanner variant="1" />
              ))}
          <TableDataSource dataSourceList={filteredDataSourceData} />
          <TableDashboardData dashboardDataList={filteredDashboardData} />
          <TableScheduleWorkflow scheduleWorkflowList={filteredScheduleData} />

          {((filteredScheduleData && filteredScheduleData.length === 0) ||
            !filteredScheduleData) && (
            <div className={classes.analyticsScheduleWorkflowCard}>
              <AnalyticsScheduleWorkflowCard />
            </div>
          )}
        </div>
        <div className={classes.rightGlowCardQuickAction}>
          {(filteredDataSourceData.length === 0 ||
            !filteredDashboardData ||
            (filteredDashboardData && filteredDashboardData.length === 0)) && (
            <div className={classes.parentWrapper}>
              <div className={classes.overviewGlowCard}>
                {filteredDataSourceData.length === 0 && (
                  <OverviewGlowCard variant="dataSource" />
                )}
                {filteredDataSourceData.length > 0 &&
                  filteredDashboardData.length === 0 && (
                    <OverviewGlowCard variant="dashboard" />
                  )}
              </div>
            </div>
          )}
          <div className={classes.parentWrapper}>
            <div className={classes.analyticsQuickActionCard}>
              <AnalyticsQuickActionCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
