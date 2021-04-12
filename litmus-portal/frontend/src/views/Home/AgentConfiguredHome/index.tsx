import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import { MainInfoContainer } from '../MainInfoContainer';
import { ProjectInfoContainer } from '../ProjectInfoContainer';
import { AgentInfoContainer } from './AgentInfoContainer';
import { RecentWorkflowRuns } from './RecentWorkflowRuns';

interface AgentConfiguredHomeProps {
  agentCount: number;
}

const AgentConfiguredHome: React.FC<AgentConfiguredHomeProps> = ({
  agentCount,
}) => {
  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  let workflowRunCount = 0;

  if (error) {
    console.error('Error fetching Workflow Data');
    return (
      <Center>
        <Typography>Error fetching the data!</Typography>
      </Center>
    );
  }

  if (data) {
    workflowRunCount = data.getWorkFlowRuns.length;
  } else {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <div>
      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : workflowRunCount > 0 ? (
        <RecentWorkflowRuns data={data} />
      ) : (
        <MainInfoContainer
          src="./icons/workflowScheduleHome.svg"
          alt="Schedule a workflow"
          heading="Schedule your first workflow"
          description={`Now it is successfully running on your Kubernetes cluster. Once you
          schedule chaos workflows, reliability analytics will be displayed
          here.`}
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/workflows',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>Schedule a workflow</Typography>
            </ButtonFilled>
          }
          // TODO: Convert to IconButton with no Ripple/Hover effect
          link={
            <Link
              to={{
                pathname: '/workflows',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              }}
            >
              <Typography>Explore pre defined workflows</Typography>
            </Link>
          }
        />
      )}

      {/* Agent info container */}
      <AgentInfoContainer agentCount={agentCount} />

      {/* Project Level info container */}
      <ProjectInfoContainer />
    </div>
  );
};

export { AgentConfiguredHome };
