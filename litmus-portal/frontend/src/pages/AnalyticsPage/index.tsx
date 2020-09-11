import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_DETAILS } from '../../graphql';
import { Workflow, WorkflowDataVars } from '../../models/graphql/workflowData';
import { RootState } from '../../redux/reducers';

const AnalyticsPage: React.FC = () => {
  const { pathname } = useLocation();
  // Getting the workflow nome from the pathname
  const workflowRunId = pathname.split('/')[3];

  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Query to get workflows
  const { data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
  );

  const workflow = data?.getWorkFlowRuns.filter(
    (w) => w.workflow_run_id === workflowRunId
  )[0];

  return (
    <Scaffold>
      {workflow ? (
        // TODO: remove this div when you code...data is in workflow variable @ishan
        <div>
          <h1>AnalyticsPage</h1>
          <pre>{JSON.stringify(workflow, undefined, 2)}</pre>
        </div>
      ) : error ? (
        <Typography>An error has occurred while fetching the data</Typography>
      ) : (
        <Loader />
      )}
    </Scaffold>
  );
};

export default AnalyticsPage;
