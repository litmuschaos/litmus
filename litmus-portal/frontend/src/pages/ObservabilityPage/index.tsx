import { AppBar, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import Tabs from '@material-ui/core/Tabs';
import React, { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Wrapper from '../../containers/layouts/Wrapper';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import useStyles from './styles';

const Overview = lazy(() => import('../../views/Observability/Overview'));
const DashboardTable = lazy(
  () => import('../../views/Observability/MonitoringDashboards/Table')
);
const DataSourceTable = lazy(
  () => import('../../views/Observability/DataSources/Table')
);
const WorkflowComparisonTable = lazy(
  () =>
    import(
      '../../views/Observability/WorkflowStatistics/WorkflowComparisonTable'
    )
);

const ObservabilityDashboard = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const observabilityTabValue = useSelector(
    (state: RootState) => state.tabNumber.observability
  );
  const tabs = useActions(TabActions);

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeObservabilityDashboardTabs(newValue);
  };

  return (
    <Wrapper>
      <section>
        <div className={classes.header}>
          <Typography variant="h3">
            {t('monitoringDashboard.heading')}
          </Typography>
        </div>
      </section>
      <AppBar className={classes.appBar}>
        <Tabs
          value={observabilityTabValue}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}
          variant="fullWidth"
        >
          <StyledTab
            label={t('monitoringDashboard.overview')}
            data-cy="overview"
          />
          <StyledTab
            label={t('monitoringDashboard.workflowStatistics')}
            data-cy="litmusDashboard"
          />
          <StyledTab
            label={t('monitoringDashboard.monitoringDashboard')}
            data-cy="monitoringDashboard"
          />
          <StyledTab
            label={t('monitoringDashboard.dataSource')}
            data-cy="data source"
          />
        </Tabs>
      </AppBar>

      <TabPanel value={observabilityTabValue} index={0}>
        <SuspenseLoader style={{ height: '50vh' }}>
          <Overview />
        </SuspenseLoader>
      </TabPanel>
      <TabPanel value={observabilityTabValue} index={1}>
        <SuspenseLoader style={{ height: '50vh' }}>
          <WorkflowComparisonTable />
        </SuspenseLoader>
      </TabPanel>
      <TabPanel value={observabilityTabValue} index={2}>
        <SuspenseLoader style={{ height: '50vh' }}>
          <DashboardTable />
        </SuspenseLoader>
      </TabPanel>
      <TabPanel value={observabilityTabValue} index={3}>
        <SuspenseLoader style={{ height: '50vh' }}>
          <DataSourceTable />
        </SuspenseLoader>
      </TabPanel>
    </Wrapper>
  );
};

export default ObservabilityDashboard;
