import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { Link } from 'react-router-dom';
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

interface AgentConfiguredHomeProps {
  agentCount: number;
}

const AgentConfiguredHome: React.FC<AgentConfiguredHomeProps> = ({
  agentCount,
}) => {
  // const { t } = useTranslation();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const { data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  return (
    <div>
      {/* First Agent Deployment Container */}
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

      {/* Agent info container */}
      <AgentInfoContainer agentCount={agentCount} />

      {/* Project Level info container */}
      <ProjectInfoContainer />
    </div>
  );
};

export { AgentConfiguredHome };
