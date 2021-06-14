import { AppBar, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import Tabs from '@material-ui/core/Tabs';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as TemplateSelectionActions from '../../redux/actions/template';
import * as WorkflowActions from '../../redux/actions/workflow';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import BrowseSchedule from '../../views/ChaosWorkflows/BrowseSchedule';
import BrowseWorkflow from '../../views/ChaosWorkflows/BrowseWorkflow';
import useStyles from './styles';

const Workflows = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const userRole = getProjectRole();
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
    history.push({
      pathname: '/create-workflow',
      search: `?projectID=${projectID}&projectRole=${userRole}`,
    });
  };

  return (
    <Scaffold>
      <section>
        <div className={classes.header}>
          <Typography variant="h3">Chaos Workflows</Typography>
          <div className={classes.scheduleBtn}>
            <ButtonFilled onClick={handleScheduleWorkflow}>
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
              backgroundColor: theme.palette.highlight,
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
        </Tabs>
      </AppBar>
      <TabPanel value={workflowTabValue} index={0}>
        <BrowseWorkflow />
      </TabPanel>
      <TabPanel value={workflowTabValue} index={1}>
        <BrowseSchedule />
      </TabPanel>
    </Scaffold>
  );
};

export default Workflows;
