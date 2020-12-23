import { AppBar, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ButtonFilled from '../../components/Button/ButtonFilled';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as TemplateSelectionActions from '../../redux/actions/template';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import WorkflowComparisonTable from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowComparisonTable';
import BrowseSchedule from '../../views/ChaosWorkflows/BrowseSchedule';
import BrowseWorkflow from '../../views/ChaosWorkflows/BrowseWorkflow';
import Templates from '../../views/ChaosWorkflows/Templates';
import useStyles from './styles';
import * as WorkflowActions from '../../redux/actions/workflow';

const Workflows = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const workflowAction = useActions(WorkflowActions);
  const template = useActions(TemplateSelectionActions);
  const workflowTabValue = useSelector(
    (state: RootState) => state.tabNumber.workflows
  );
  const tabs = useActions(TabActions);

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeWorkflowsTabs(newValue);
  };

  const handleScheduleWorkflow = () => {
    workflowAction.setWorkflowDetails({
      isCustomWorkflow: false,
      customWorkflows: [],
    });
    template.selectTemplate({ selectedTemplateID: 0, isDisable: true });
    history.push('/create-workflow');
  };

  return (
    <Scaffold>
      <section>
        <div className={classes.header}>
          <Typography variant="h3">Chaos Workflows</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled
              isPrimary={false}
              handleClick={handleScheduleWorkflow}
            >
              {t('workflows.scheduleAWorkflow')}
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
          <StyledTab
            label={`${t('workflows.browseWorkflows')}`}
            data-cy="browseWorkflow"
          />
          <StyledTab
            label={`${t('workflows.schedules')}`}
            data-cy="browseSchedule"
          />
          <StyledTab
            label={`${t('workflows.templates')}`}
            data-cy="templates"
          />
          <StyledTab
            label={`${t('workflows.analytics')}`}
            data-cy="analyticsWorkflow"
          />
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
