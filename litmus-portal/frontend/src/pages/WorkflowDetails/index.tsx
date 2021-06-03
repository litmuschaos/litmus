import { useQuery } from '@apollo/client';
import { AppBar, Typography, useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs/Tabs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import {
  SCHEDULE_DETAILS,
  WORKFLOW_DETAILS_WITH_EXEC_DATA,
  WORKFLOW_EVENTS_WITH_EXEC_DATA,
} from '../../graphql';
import {
  ScheduleDataVars,
  Schedules,
  ScheduleWorkflow,
} from '../../models/graphql/scheduleData';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowSubscription,
  WorkflowSubscriptionInput,
} from '../../models/graphql/workflowData';
import useActions from '../../redux/actions';
import * as NodeSelectionActions from '../../redux/actions/nodeSelection';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import ArgoWorkflow from '../../views/WorkflowDetails/ArgoWorkflow';
import NodeLogsModal from '../../views/WorkflowDetails/LogsModal';
import WorkflowInfo from '../../views/WorkflowDetails/WorkflowInfo';
import WorkflowNodeInfo from '../../views/WorkflowDetails/WorkflowNodeInfo';
import NodeTable from '../../views/WorkflowDetails/WorkflowTable';
import useStyles from './styles';

interface URLParams {
  workflowRunId: string;
}

const WorkflowDetails: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
  const [isInfoToggled, setIsInfoToggled] = useState<boolean>(false);
  // State for Checking if workflow failed
  const [isWorkflowFailed, setWorkflowFailed] = useState<boolean>(false);
  const [
    workflowSchedulesDetails,
    setworkflowSchedulesDetails,
  ] = useState<ScheduleWorkflow>();

  const tabs = useActions(TabActions);
  const nodeSelection = useActions(NodeSelectionActions);

  // get ProjectID
  const projectID = getProjectID();

  const workflowDetailsTabValue = useSelector(
    (state: RootState) => state.tabNumber.node
  );

  const { pod_name } = useSelector((state: RootState) => state.selectedNode);

  const { workflowRunId }: URLParams = useParams();

  // Query to get workflows
  const { subscribeToMore, data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS_WITH_EXEC_DATA,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          workflow_run_ids: [workflowRunId],
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const workflow = data?.getWorkflowRuns.workflow_runs[0];

  // Apollo query to get the scheduled data
  const { data: SchedulesData, loading } = useQuery<
    Schedules,
    ScheduleDataVars
  >(SCHEDULE_DETAILS, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  // Using subscription to get realtime data
  useEffect(() => {
    if (workflow?.phase && workflow.phase === 'Running') {
      subscribeToMore<WorkflowSubscription, WorkflowSubscriptionInput>({
        document: WORKFLOW_EVENTS_WITH_EXEC_DATA,
        variables: { projectID },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const modifiedWorkflows = prev.getWorkflowRuns.workflow_runs.slice();
          const newWorkflow = subscriptionData.data.workflowEventListener;

          // Update only the required workflowRun
          if (
            modifiedWorkflows[0].workflow_run_id === newWorkflow.workflow_run_id
          )
            modifiedWorkflows[0] = newWorkflow;

          const totalNoOfWorkflows =
            prev.getWorkflowRuns.total_no_of_workflow_runs;

          return {
            ...prev,
            getWorkflowRuns: {
              total_no_of_workflow_runs: totalNoOfWorkflows,
              workflow_runs: modifiedWorkflows,
            },
          };
        },
      });
    }
  }, [data]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    tabs.changeWorkflowDetailsTabs(newValue);
  };

  useEffect(() => {
    const scheduledWorkflow = SchedulesData?.getScheduledWorkflows.filter(
      (schedulesWorkflow) => {
        return schedulesWorkflow.workflow_id === workflow?.workflow_id;
      }
    );
    if (scheduledWorkflow) {
      setworkflowSchedulesDetails(
        (scheduledWorkflow[0] ? scheduledWorkflow[0] : null) as ScheduleWorkflow
      );
    }
  }, [SchedulesData]);

  // On fresh screen refresh 'Workflow' Tab would be selected
  useEffect(() => {
    tabs.changeWorkflowDetailsTabs(0);
  }, []);

  // Setting NodeId of first Node in redux for selection of first node in Argo graph by default
  useEffect(() => {
    if (workflow && pod_name === '') {
      if (
        Object.keys(JSON.parse(workflow.execution_data as string).nodes).length
      ) {
        const firstNodeId = JSON.parse(workflow.execution_data as string).nodes[
          Object.keys(JSON.parse(workflow.execution_data as string).nodes)[0]
        ].name;
        nodeSelection.selectNode({
          ...JSON.parse(workflow.execution_data as string).nodes[firstNodeId],
          pod_name: firstNodeId,
        });
      } else {
        setWorkflowFailed(true);
      }
    }
  }, [data]);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton />
        </div>
        {/* If workflow data is present then display the workflow details */}
        {workflow && pod_name !== '' && !loading ? (
          <div>
            <Typography data-cy="wfName" className={classes.title}>
              {t('workflowDetailsView.headerDesc')} {workflow.workflow_name}
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
                    backgroundColor: theme.palette.highlight,
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
                  <div>
                    {pod_name !==
                    JSON.parse(workflow.execution_data).nodes[
                      Object.keys(
                        JSON.parse(workflow.execution_data as string).nodes
                      )[0]
                    ].name ? (
                      /* Node details and Logs */
                      <WorkflowNodeInfo
                        manifest={
                          workflowSchedulesDetails?.workflow_manifest as string
                        }
                        setIsInfoToggled={setIsInfoToggled}
                        cluster_id={workflow.cluster_id}
                        workflow_run_id={workflow.workflow_run_id}
                        data={
                          JSON.parse(workflow.execution_data) as ExecutionData
                        }
                      />
                    ) : (
                      /* Workflow Details */
                      <WorkflowInfo
                        tab={1}
                        setIsInfoToggled={setIsInfoToggled}
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
              {/* Workflow Info */}
              <WorkflowInfo
                tab={2}
                cluster_name={workflow.cluster_name}
                data={JSON.parse(workflow.execution_data) as ExecutionData}
              />
              {/* Table for all Node details */}
              <NodeTable
                manifest={workflowSchedulesDetails?.workflow_manifest as string}
                data={JSON.parse(workflow.execution_data) as ExecutionData}
                handleClose={() => setLogsModalOpen(true)}
              />
              {/* Modal for viewing logs of a node */}
              <NodeLogsModal
                logsOpen={logsModalOpen}
                handleClose={() => setLogsModalOpen(false)}
                cluster_id={workflow.cluster_id}
                workflow_run_id={workflow.workflow_run_id}
                data={JSON.parse(workflow.execution_data) as ExecutionData}
                workflow_name={workflow.workflow_name}
              />
            </TabPanel>
          </div>
        ) : error ? (
          <Typography>{t('workflowDetails.fetchError')}</Typography>
        ) : isWorkflowFailed ? (
          <Typography>{t('workflowDetails.workflowNotStarted')}</Typography>
        ) : (
          <Loader />
        )}
      </div>
    </Scaffold>
  );
};

export default WorkflowDetails;
