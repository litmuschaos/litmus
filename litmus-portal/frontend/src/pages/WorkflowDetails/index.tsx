import { useQuery } from '@apollo/client';
import { AppBar, Typography, useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs/Tabs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ButtonOutlined } from 'litmus-ui';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import BackButton from '../../components/Button/BackButton';
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
import WorkflowNodeInfo from '../../views/WorkflowDetails/WorkflowNodeInfo';
import useStyles from './styles';
import NodeTable from '../../views/WorkflowDetails/WorkflowTable';
import WorkflowInfo from '../../views/WorkflowDetails/WorkflowInfo';
import NodeLogsModal from '../../views/WorkflowDetails/LogsModal';

const WorkflowDetails: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
  const [isInfoToggled, setIsInfoToggled] = useState<boolean>(true);

  const tabs = useActions(TabActions);
  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const workflowDetailsTabValue = useSelector(
    (state: RootState) => state.tabNumber.node
  );

  // Getting the workflow nome from the pathname
  const { pathname } = useLocation();
  const workflowRunId = pathname.split('/')[2];

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

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeWorkflowDetailsTabs(newValue);
  };

  const { pod_name } = useSelector((state: RootState) => state.selectedNode);

  // On fresh screen refresh 'Workflow' Tab would be selected
  useEffect(() => {
    tabs.changeWorkflowDetailsTabs(0);
  }, []);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton isDisabled={false} />
        </div>
        {/* If workflow data is present then display the workflow details */}
        {workflow ? (
          <div>
            <Typography data-cy="wfName" className={classes.title}>
              {t('workflowDetailsView.headerDesc')} {workflow.workflow_name}
            </Typography>
            <Typography className={classes.subtitle}>
              {t('workflowDetailsView.headerMiniDesc')}
            </Typography>

            {/* AppBar */}
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
                <StyledTab label="Graph View" />
                <StyledTab label="Table View" />
              </Tabs>
            </AppBar>
            <TabPanel value={workflowDetailsTabValue} index={0}>
              <div className={classes.graphView}>
                {/* Argo Workflow DAG Graph */}
                <ArgoWorkflow
                  nodes={
                    (JSON.parse(workflow.execution_data) as ExecutionData).nodes
                  }
                  setIsInfoToggled={setIsInfoToggled}
                />
                {/* Workflow Details and Experiment Logs */}
                {isInfoToggled ? (
                  <div className={classes.infoDashboard}>
                    <ButtonOutlined
                      className={classes.closeButton}
                      onClick={() => {
                        setIsInfoToggled(false);
                      }}
                    >
                      &#x2715;
                    </ButtonOutlined>
                    {pod_name !==
                    JSON.parse(workflow.execution_data).nodes[
                      Object.keys(
                        JSON.parse(workflow.execution_data as string).nodes
                      )[0]
                    ].name ? (
                      /* Node details and Logs */
                      <WorkflowNodeInfo
                        workflow_name={workflow.workflow_name}
                        cluster_id={workflow.cluster_id}
                        workflow_run_id={workflow.workflow_run_id}
                        pod_namespace={
                          (JSON.parse(workflow.execution_data) as ExecutionData)
                            .namespace
                        }
                      />
                    ) : (
                      /* Workflow Details */
                      <WorkflowInfo
                        tab={1}
                        cluster_name={workflow.cluster_name}
                        data={
                          JSON.parse(workflow.execution_data) as ExecutionData
                        }
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </TabPanel>
            <TabPanel value={workflowDetailsTabValue} index={1}>
              <div className={classes.nodesTable}>
                {/* Workflow Info */}
                <WorkflowInfo
                  tab={2}
                  cluster_name={workflow.cluster_name}
                  data={JSON.parse(workflow.execution_data) as ExecutionData}
                />
                {/* Table for all Node details */}
                <NodeTable
                  data={JSON.parse(workflow.execution_data) as ExecutionData}
                  handleClose={() => setLogsModalOpen(true)}
                />
              </div>
              {/* Modal for viewing logs of a node */}
              <NodeLogsModal
                logsOpen={logsModalOpen}
                handleClose={() => setLogsModalOpen(false)}
                cluster_id={workflow.cluster_id}
                workflow_run_id={workflow.workflow_run_id}
                pod_namespace={
                  (JSON.parse(workflow.execution_data) as ExecutionData)
                    .namespace
                }
                data={JSON.parse(workflow.execution_data) as ExecutionData}
                workflow_name={workflow.workflow_name}
              />
            </TabPanel>
          </div>
        ) : error ? (
          <Typography>{t('workflowDetails.fetchError')}</Typography>
        ) : (
          <Loader />
        )}
      </div>
    </Scaffold>
  );
};

export default WorkflowDetails;
