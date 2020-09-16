import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowSubscription,
} from '../../models/graphql/workflowData';
import { RootState } from '../../redux/reducers';
import ArgoWorkflow from '../../views/WorkflowDetails/ArgoWorkflow';
import WorkflowInfo from '../../views/WorkflowDetails/WorkflowInfo';
import useStyles from './styles';

const WorkflowDetails: React.FC = () => {
  const classes = useStyles();
  const { pathname } = useLocation();
  // Getting the workflow nome from the pathname
  const workflowRunId = pathname.split('/')[3];
  const { t } = useTranslation();

  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
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

  return (
    <Scaffold>
      {workflow ? (
        <div className={classes.root}>
          <div className={classes.workflowGraph}>
            <Typography className={classes.heading}>
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
          <WorkflowInfo
            workflow_name={workflow.workflow_name}
            execution_data={
              JSON.parse(workflow?.execution_data) as ExecutionData
            }
            cluster_name={workflow.cluster_name}
          />
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
