/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import { AppBar, Typography, useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs/Tabs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Scaffold from '../../containers/layouts/Scaffold';
import BackButton from '../../components/Button/BackButton';
import {
  SCHEDULE_DETAILS,
  WORKFLOW_DETAILS,
  WORKFLOW_EVENTS,
  WORKFLOW_LIST_DETAILS,
} from '../../graphql';
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
import {
  WorkflowList,
  WorkflowListDataVars,
} from '../../models/graphql/workflowListData';
import {
  Schedules,
  ScheduleDataVars,
  ScheduleWorkflow,
} from '../../models/graphql/scheduleData';
import * as NodeSelectionActions from '../../redux/actions/nodeSelection';

const WorkflowDetails: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
  const [isInfoToggled, setIsInfoToggled] = useState<boolean>(true);
  const [resilienceScore, setResilienceScore] = useState(0);
  const [
    workflowSchedulesDetails,
    setworkflowSchedulesDetails,
  ] = useState<ScheduleWorkflow>();

  const tabs = useActions(TabActions);
  const nodeSelection = useActions(NodeSelectionActions);
  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const workflowDetailsTabValue = useSelector(
    (state: RootState) => state.tabNumber.node
  );

  const { pod_name } = useSelector((state: RootState) => state.selectedNode);

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

  // Apollo query to get the scheduled workflow data
  const { data: scheduledWorkflowData } = useQuery<
    WorkflowList,
    WorkflowListDataVars
  >(WORKFLOW_LIST_DETAILS, {
    variables: {
      projectID: selectedProjectID,
      workflowIDs: [workflow?.workflow_id as string],
    },
    pollInterval: 100,
  });

  // Apollo query to get the scheduled data
  const { data: SchedulesData } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

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

  // TODO: Will be removed (below useEffect and required queries) once Resilience score calculations shifts to Backend
  useEffect(() => {
    if (workflow?.execution_data) {
      let weightSum = 0;
      let totalTestResult = 0;
      const weightsMap = new Map<string, number>();
      const weightsArray = scheduledWorkflowData?.ListWorkflow[0].weightages;
      weightsArray?.forEach((weightEntry) => {
        weightsMap.set(weightEntry.experiment_name, weightEntry.weightage);
      });
      const { nodes } = JSON.parse(workflow?.execution_data) as ExecutionData;
      Object.keys(nodes).forEach((key) => {
        const node = nodes[key];
        if (node?.chaosData) {
          if (
            node.chaosData.experimentVerdict === 'Pass' ||
            node.chaosData.experimentVerdict === 'Fail'
          ) {
            if (weightsMap.has(node.chaosData.experimentName)) {
              totalTestResult +=
                ((weightsMap.get(
                  node.chaosData.experimentName as string
                ) as number) *
                  parseInt(node.chaosData.probeSuccessPercentage, 10)) /
                100;
              weightSum += weightsMap.get(
                node.chaosData.experimentName as string
              ) as number;
            }
          }
        }
      });
      weightSum
        ? setResilienceScore((totalTestResult / weightSum) * 100)
        : setResilienceScore(0);
    }
  }, [scheduledWorkflowData, data]);

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
      const firstNodeId = JSON.parse(workflow?.execution_data as string).nodes[
        Object.keys(JSON.parse(workflow?.execution_data as string).nodes)[0]
      ].name;
      nodeSelection.selectNode({
        ...JSON.parse(workflow?.execution_data as string).nodes[firstNodeId],
        pod_name: firstNodeId,
      });
    }
  }, [data]);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton isDisabled={false} />
        </div>
        {/* If workflow data is present then display the workflow details */}
        {workflow && pod_name !== '' ? (
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
                  <div>
                    {pod_name !==
                      JSON.parse(workflow.execution_data).nodes[
                        Object.keys(
                          JSON.parse(workflow.execution_data as string).nodes
                        )[0]
                      ].name && pod_name !== '' ? (
                      /* Node details and Logs */
                      <WorkflowNodeInfo
                        manifest={
                          workflowSchedulesDetails?.workflow_manifest as string
                        }
                        setIsInfoToggled={setIsInfoToggled}
                        cluster_id={workflow.cluster_id}
                        workflow_run_id={workflow.workflow_run_id}
                        pod_namespace={
                          (JSON.parse(workflow.execution_data) as ExecutionData)
                            .namespace
                        }
                        selectedNode={
                          (JSON.parse(workflow.execution_data) as ExecutionData)
                            .nodes[pod_name]
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
                        resiliencyScore={resilienceScore}
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
                  resiliencyScore={resilienceScore}
                />
                {/* Table for all Node details */}
                <NodeTable
                  manifest={
                    workflowSchedulesDetails?.workflow_manifest as string
                  }
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
