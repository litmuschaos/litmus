import { useQuery } from '@apollo/client';
import { AppBar, Typography, useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs/Tabs';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowSubscription,
} from '../../models/graphql/workflowData';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import ArgoWorkflow from '../../views/WorkflowDetails/ArgoWorkflow';
import WorkflowInfo from '../../views/WorkflowDetails/WorkflowInfo';
import WorkflowNodeInfo from '../../views/WorkflowDetails/WorkflowNodeInfo';
import useStyles from './styles';
import TopNavButtons from './TopNavButtons';

interface TopNavButtonsProps {
  isAnalyticsToggled: boolean;
  isExportToggled: boolean;
  isInfoToggled: boolean;
}

const WorkflowDetails: React.FC = () => {
  const classes = useStyles();

  const [isToggled, setIsToggled] = React.useState<TopNavButtonsProps>({
    isAnalyticsToggled: false,
    isExportToggled: false,
    isInfoToggled: false,
  });

  const tabs = useActions(TabActions);
  const { pathname } = useLocation();
  // Getting the workflow nome from the pathname
  const workflowRunId = pathname.split('/')[3];
  const { t } = useTranslation();

  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const workflowDetailsTabValue = useSelector(
    (state: RootState) => state.tabNumber.node
  );

  // Query to get workflows
  const { subscribeToMore, data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
  );

  const workflow = data?.getWorkFlowRuns.filter(
    (w) => w.workflow_run_id === workflowRunId
  )[0];

  // Using subscription to get realtime data
  useEffect(() => {
    if (
      workflow?.execution_data &&
      (JSON.parse(workflow?.execution_data) as ExecutionData).phase ===
        'Running'
    ) {
      subscribeToMore<WorkflowSubscription>({
        document: WORKFLOW_EVENTS,
        variables: { projectID: selectedProjectID },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const modifiedWorkflows = prev.getWorkFlowRuns.slice();
          const newWorkflow = subscriptionData.data.workflowEventListener;

          // Updating the query data
          let i = 0;
          for (; i < modifiedWorkflows.length; i++) {
            if (
              modifiedWorkflows[i].workflow_run_id ===
              newWorkflow.workflow_run_id
            ) {
              modifiedWorkflows[i] = newWorkflow;
              break;
            }
          }
          if (i === modifiedWorkflows.length)
            modifiedWorkflows.unshift(newWorkflow);

          return { ...prev, getWorkFlowRuns: modifiedWorkflows };
        },
      });
    }
  }, [data]);

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeWorkflowDetailsTabs(newValue);
  };

  // On fresh screen refresh 'Workflow' Tab would be selected
  useEffect(() => {
    tabs.changeWorkflowDetailsTabs(0);
  }, []);

  return (
    <Scaffold>
      <TopNavButtons isToggled={isToggled} setIsToggled={setIsToggled} />
      {/* If workflow data is present then display the workflow details */}
      {workflow ? (
        <div className={classes.root}>
          <div className={classes.workflowGraph}>
            <Typography data-cy="wfName" className={classes.heading}>
              {workflow.workflow_name}
            </Typography>
            <Typography>{t('workflowDetails.detailedLog')}</Typography>

            {/* Argo Workflow DAG Graph */}
            <ArgoWorkflow
              nodes={
                (JSON.parse(workflow.execution_data) as ExecutionData).nodes
              }
            />
          </div>
          {isToggled.isInfoToggled ? (
            <div className={classes.workflowSideBar}>
              <AppBar
                position="static"
                color="default"
                className={classes.appBar}
              >
                <Tabs
                  value={workflowDetailsTabValue || 0}
                  onChange={handleChange}
                  TabIndicatorProps={{
                    style: {
                      backgroundColor: theme.palette.secondary.dark,
                    },
                  }}
                  variant="fullWidth"
                >
                  <StyledTab label="Workflow" />
                  <StyledTab label="Nodes" />
                </Tabs>
              </AppBar>
              <TabPanel value={workflowDetailsTabValue} index={0}>
                <div data-cy="browseWorkflow">
                  <WorkflowInfo
                    workflow_name={workflow.workflow_name}
                    execution_data={
                      JSON.parse(workflow?.execution_data) as ExecutionData
                    }
                    cluster_name={workflow.cluster_name}
                  />
                </div>
              </TabPanel>
              <TabPanel
                data-cy="scheduleWorkflow"
                value={workflowDetailsTabValue}
                index={1}
              >
                <div data-cy="browseWorkflow">
                  <WorkflowNodeInfo
                    cluster_id={workflow.cluster_id}
                    workflow_run_id={workflow.workflow_run_id}
                    pod_namespace={
                      (JSON.parse(workflow.execution_data) as ExecutionData)
                        .namespace
                    }
                  />
                </div>
              </TabPanel>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : error ? (
        <Typography>{t('workflowDetails.fetchError')}</Typography>
      ) : (
        <Loader />
      )}
    </Scaffold>
  );
};

export default WorkflowDetails;
