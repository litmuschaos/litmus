import { useQuery } from '@apollo/client';
import { AppBar, Typography, useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs/Tabs';
import React, { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import { StyledTab, TabPanel } from '../../components/Tabs';
import Wrapper from '../../containers/layouts/Wrapper';
import {
  GET_WORKFLOW_DETAILS,
  WORKFLOW_DETAILS_WITH_EXEC_DATA,
  WORKFLOW_EVENTS_WITH_EXEC_DATA,
} from '../../graphql';
import { ScheduleWorkflow } from '../../models/graphql/scheduleData';
import {
  ExecutionData,
  Workflow,
  WorkflowDataRequest,
  WorkflowSubscription,
  WorkflowSubscriptionRequest,
} from '../../models/graphql/workflowData';
import {
  GetWorkflowsRequest,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import useActions from '../../redux/actions';
import * as NodeSelectionActions from '../../redux/actions/nodeSelection';
import * as TabActions from '../../redux/actions/tabs';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import ArgoWorkflow from '../../views/WorkflowDetails/ArgoWorkflow';
import WorkflowInfo from '../../views/WorkflowDetails/WorkflowInfo';
import WorkflowNodeInfo from '../../views/WorkflowDetails/WorkflowNodeInfo';
import useStyles from './styles';

const NodeLogsModal = lazy(
  () => import('../../views/WorkflowDetails/LogsModal')
);

const NodeTable = lazy(
  () => import('../../views/WorkflowDetails/WorkflowTable')
);

interface URLParams {
  workflowRunID: string;
}

const WorkflowDetails: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
  const [isInfoToggled, setIsInfoToggled] = useState<boolean>(false);
  const [viewAll, setViewAll] = useState<boolean>(false);
  // State for Checking if workflow failed
  const [isWorkflowFailed, setWorkflowFailed] = useState<boolean>(false);
  const [workflowSchedulesDetails, setworkflowSchedulesDetails] =
    useState<ScheduleWorkflow>();

  const tabs = useActions(TabActions);
  const nodeSelection = useActions(NodeSelectionActions);

  // get ProjectID
  const projectID = getProjectID();

  const workflowDetailsTabValue = useSelector(
    (state: RootState) => state.tabNumber.node
  );

  const { podName } = useSelector((state: RootState) => state.selectedNode);

  const { workflowRunID }: URLParams = useParams();
  // Query to get workflows
  const { subscribeToMore, data, error } = useQuery<
    Workflow,
    WorkflowDataRequest
  >(WORKFLOW_DETAILS_WITH_EXEC_DATA, {
    variables: {
      request: {
        projectID,
        workflowRunIDs: [workflowRunID],
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const workflowRun = data?.listWorkflowRuns.workflowRuns[0];

  const { data: workflowData, loading } = useQuery<
    ScheduledWorkflows,
    GetWorkflowsRequest
  >(GET_WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
        workflowIDs: [workflowRun?.workflowID ?? ' '],
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Using subscription to get realtime data
  useEffect(() => {
    if (workflowRun?.phase && workflowRun.phase === 'Running') {
      subscribeToMore<WorkflowSubscription, WorkflowSubscriptionRequest>({
        document: WORKFLOW_EVENTS_WITH_EXEC_DATA,
        variables: { projectID },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data || !prev || !prev.listWorkflowRuns)
            return prev;

          const modifiedWorkflows = prev.listWorkflowRuns.workflowRuns.slice();
          const newWorkflow = subscriptionData.data.getWorkflowEvents;

          // Update only the required workflowRun
          if (modifiedWorkflows[0].workflowRunID === newWorkflow.workflowRunID)
            modifiedWorkflows[0] = newWorkflow;

          const totalNoOfWorkflows =
            prev.listWorkflowRuns.totalNoOfWorkflowRuns;

          return {
            listWorkflowRuns: {
              totalNoOfWorkflowRuns: totalNoOfWorkflows,
              workflowRuns: modifiedWorkflows,
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
    const scheduledWorkflow = workflowData?.listWorkflows.workflows;
    if (scheduledWorkflow) {
      setworkflowSchedulesDetails(
        (scheduledWorkflow[0]
          ? scheduledWorkflow[0]
          : null) as unknown as ScheduleWorkflow
      );
    }
  }, [workflowData]);

  // On fresh screen refresh 'Workflow' Tab would be selected
  useEffect(() => {
    tabs.changeWorkflowDetailsTabs(0);
  }, []);

  // Setting NodeId of first Node in redux for selection of first node in Argo graph by default
  useEffect(() => {
    if (workflowRun !== undefined && podName === '') {
      if (
        JSON.parse(workflowRun.executionData as string).nodes !== null &&
        Object.keys(JSON.parse(workflowRun.executionData as string).nodes)
          .length
      ) {
        const firstNodeId = JSON.parse(workflowRun.executionData as string)
          .nodes[
          Object.keys(JSON.parse(workflowRun.executionData as string).nodes)[0]
        ].name;
        nodeSelection.selectNode({
          ...JSON.parse(workflowRun.executionData as string).nodes[firstNodeId],
          podName: firstNodeId,
        });
      } else {
        setWorkflowFailed(true);
      }
    }
  }, [workflowRun]);

  return (
    <Wrapper>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton />
        </div>
        {/* If workflowRun data is present then display the workflowRun details */}
        {workflowRun && podName !== '' && !loading ? (
          <div>
            <Typography data-cy="wfName" className={classes.title}>
              {t('workflowDetailsView.headerDesc')} {workflowRun.workflowName}
            </Typography>
            <Typography data-cy="wfName" className={classes.desc}>
              {workflowSchedulesDetails?.workflowDescription &&
              workflowSchedulesDetails?.workflowDescription.length > 200 &&
              !viewAll ? (
                <div>
                  {workflowSchedulesDetails?.workflowDescription.slice(0, 200)}
                  ...{' '}
                  <span
                    role="button"
                    className={classes.viewAll}
                    tabIndex={0}
                    onKeyDown={() => {}}
                    onClick={() => setViewAll(true)}
                  >
                    View All
                  </span>{' '}
                </div>
              ) : (
                workflowSchedulesDetails?.workflowDescription
              )}
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
                data-cy="statsTabs"
              >
                <StyledTab label="Graph View" />
                <StyledTab label="Table View" />
              </Tabs>
            </AppBar>
            <TabPanel value={workflowDetailsTabValue} index={0}>
              <div
                className={classes.graphView}
                data-cy="dagreGraphWorkflowLevel"
              >
                {/* Argo Workflow DAG Graph */}
                <ArgoWorkflow
                  nodes={
                    (JSON.parse(workflowRun.executionData) as ExecutionData)
                      .nodes
                  }
                  setIsInfoToggled={setIsInfoToggled}
                />
                <SuspenseLoader style={{ height: '50vh' }}>
                  {/* Workflow Details and Experiment Logs */}
                  {isInfoToggled ? (
                    <div>
                      {podName !==
                      JSON.parse(workflowRun.executionData).nodes[
                        Object.keys(
                          JSON.parse(workflowRun.executionData as string).nodes
                        )[0]
                      ].name ? (
                        /* Node details and Logs */
                        <WorkflowNodeInfo
                          manifest={
                            workflowSchedulesDetails?.workflowManifest as string
                          }
                          setIsInfoToggled={setIsInfoToggled}
                          clusterID={workflowRun.clusterID}
                          workflowRunID={workflowRun.workflowRunID}
                          data={
                            JSON.parse(
                              workflowRun.executionData
                            ) as ExecutionData
                          }
                        />
                      ) : (
                        /* Workflow Details */
                        <WorkflowInfo
                          tab={1}
                          setIsInfoToggled={setIsInfoToggled}
                          workflowPhase={workflowRun.phase}
                          clusterName={workflowRun.clusterName}
                          data={
                            JSON.parse(
                              workflowRun.executionData
                            ) as ExecutionData
                          }
                          resiliencyScore={workflowRun.resiliencyScore}
                        />
                      )}
                    </div>
                  ) : null}
                </SuspenseLoader>
              </div>
            </TabPanel>
            <TabPanel value={workflowDetailsTabValue} index={1}>
              <SuspenseLoader style={{ height: '50vh' }}>
                {/* Workflow Info */}
                <WorkflowInfo
                  tab={2}
                  workflowPhase={workflowRun.phase}
                  clusterName={workflowRun.clusterName}
                  data={JSON.parse(workflowRun.executionData) as ExecutionData}
                  resiliencyScore={workflowRun.resiliencyScore}
                />
                {/* Table for all Node details */}
                <NodeTable
                  manifest={
                    workflowSchedulesDetails?.workflowManifest as string
                  }
                  data={JSON.parse(workflowRun.executionData) as ExecutionData}
                  handleClose={() => setLogsModalOpen(true)}
                />
                {/* Modal for viewing logs of a node */}
                <NodeLogsModal
                  logsOpen={logsModalOpen}
                  handleClose={() => setLogsModalOpen(false)}
                  clusterID={workflowRun.clusterID}
                  workflowRunID={workflowRun.workflowRunID}
                  data={JSON.parse(workflowRun.executionData) as ExecutionData}
                  workflowName={workflowRun.workflowName}
                />
              </SuspenseLoader>
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
    </Wrapper>
  );
};

export default WorkflowDetails;
