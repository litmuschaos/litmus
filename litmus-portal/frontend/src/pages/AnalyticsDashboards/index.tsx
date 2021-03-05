import { AppBar, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import DataSourceTable from '../../views/AnalyticsDashboard/DataSource/Table';
import DashboardTable from '../../views/AnalyticsDashboard/KubernetesDashboards/Table';
import WorkflowComparisonTable from '../../views/AnalyticsDashboard/LitmusDashboard/WorkflowComparisonTable';
import Overview from '../../views/AnalyticsDashboard/Overview';
import useStyles from './styles';

const AnalyticsDashboard = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const analyticsTabValue = useSelector(
    (state: RootState) => state.tabNumber.analytics
  );
  const tabs = useActions(TabActions);

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeAnalyticsDashboardTabs(newValue);
  };

  return (
    <Scaffold>
      <section>
        <div className={classes.header}>
          <Typography variant="h3">
            {t('analyticsDashboard.heading')}
          </Typography>
        </div>
      </section>
      <AppBar position="static" color="default" className={classes.appBar}>
        <Tabs
          value={analyticsTabValue}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}
          variant="fullWidth"
        >
          <StyledTab
            label={t('analyticsDashboard.overview')}
            data-cy="overview"
          />
          <StyledTab
            label={t('analyticsDashboard.workflowDashboard')}
            data-cy="litmusDashboard"
          />
          <StyledTab
            label={t('analyticsDashboard.applicationDashboard')}
            data-cy="kubernetesDashboard"
          />
        </Tabs>
      </AppBar>

      <TabPanel value={analyticsTabValue} index={0}>
        <Overview />
      </TabPanel>
      <TabPanel value={analyticsTabValue} index={1}>
        <WorkflowComparisonTable />
      </TabPanel>
      <TabPanel value={analyticsTabValue} index={2}>
        <DashboardTable />
        <div className={classes.dataSourceTable}>
          <DataSourceTable />
        </div>
      </TabPanel>
    </Scaffold>
  );
};

export default AnalyticsDashboard;
