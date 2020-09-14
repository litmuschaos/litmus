import { AppBar, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { useSelector } from 'react-redux';
import ButtonFilled from '../../components/Button/ButtonFilled';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import BrowseSchedule from '../../views/ChaosWorkflows/BrowseSchedule';
import BrowseWorkflow from '../../views/ChaosWorkflows/BrowseWorkflow';
import Templates from '../../views/ChaosWorkflows/Templates';
import WorkflowComparisonTable from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowComparisonTable';
import useStyles from './styles';

const Workflows = () => {
  const classes = useStyles();
  const workflowTabValue = useSelector(
    (state: RootState) => state.tabNumber.workflows
  );
  const tabs = useActions(TabActions);

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeWorkflowsTabs(newValue);
  };

  return (
    <Scaffold>
      <section>
        <div className={classes.header}>
          <Typography variant="h3">Chaos Workflows</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled
              isPrimary={false}
              handleClick={() => history.push('/create-workflow')}
            >
              <>Schedule a workflow</>
            </ButtonFilled>
          </div>
        </div>
      </section>
      <AppBar position="static" color="default" className={classes.appBar}>
        <Tabs
          value={workflowTabValue}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.secondary.dark,
            },
          }}
          variant="fullWidth"
        >
          <StyledTab label="Browse workflows" />
          <StyledTab label="Schedules" />
          <StyledTab label="Templates" />
          <StyledTab label="Analytics" />
        </Tabs>
      </AppBar>
      <TabPanel value={workflowTabValue} index={0}>
        <BrowseWorkflow />
      </TabPanel>
      <TabPanel value={workflowTabValue} index={1}>
        <BrowseSchedule />
      </TabPanel>
      <TabPanel value={workflowTabValue} index={2}>
        <Templates />
      </TabPanel>
      <TabPanel value={workflowTabValue} index={3}>
        <WorkflowComparisonTable />
      </TabPanel>
    </Scaffold>
  );
};

export default Workflows;
