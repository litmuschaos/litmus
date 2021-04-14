import { useQuery } from '@apollo/client';
import { Link, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
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
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const tabs = useActions(TabActions);

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
        <Typography>{t('homeViews.agentConfiguredHome.error')}</Typography>
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
          heading={t('homeViews.agentConfiguredHome.noWorkflow.heading')}
          description={t(
            'homeViews.agentConfiguredHome.noWorkflow.description'
          )}
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/create-workflow',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>
                {t('homeViews.agentConfiguredHome.noWorkflow.schedule')}
              </Typography>
            </ButtonFilled>
          }
          link={
            <Link
              underline="none"
              color="primary"
              onClick={() => {
                tabs.changeWorkflowsTabs(2);
                history.push({
                  pathname: '/workflows',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>
                {t('homeViews.agentConfiguredHome.noWorkflow.explore')}
              </Typography>
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
