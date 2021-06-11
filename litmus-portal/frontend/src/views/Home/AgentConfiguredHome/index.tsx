import { useQuery } from '@apollo/client';
import { Link, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgentDeployModal } from '../../../components/AgentDeployModal';
import Loader from '../../../components/Loader';
import { MainInfoContainer } from '../../../components/MainInfoContainer';
import { OverviewContainer } from '../../../components/OverviewContainer';
import { RecentOverviewContainer } from '../../../components/RecentOverviewContainer';
import Center from '../../../containers/layouts/Center';
import { WORKFLOW_DETAILS } from '../../../graphql';
import { Role } from '../../../models/graphql/user';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import { ProjectInfoContainer } from '../ProjectInfoContainer';
import useStyles from './styles';
import { WorkflowRunCard } from './WorkflowRunCard';

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
  const classes = useStyles();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          pagination: {
            page: 0,
            limit: 3,
          },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const workflowRunCount = data?.getWorkflowRuns.total_no_of_workflow_runs ?? 0;

  if (error) {
    console.error('Error fetching Workflow Data');
    return (
      <Center>
        <Typography>{t('homeViews.agentConfiguredHome.error')}</Typography>
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
        <RecentOverviewContainer
          heading={t(
            'homeViews.agentConfiguredHome.recentWorkflowRuns.heading'
          )}
          link={
            <Link
              underline="none"
              color="primary"
              onClick={() => {
                tabs.changeWorkflowsTabs(0);
                history.push({
                  pathname: '/workflows',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography className={classes.linkPointer}>
                {t('homeViews.agentConfiguredHome.recentWorkflowRuns.viewAll')}
              </Typography>
            </Link>
          }
          buttonLink="/create-workflow"
          buttonImgSrc="./icons/calendarBlank.svg"
          buttonImgAlt="calendar"
          buttonText={t(
            'homeViews.agentConfiguredHome.recentWorkflowRuns.schedule'
          )}
        >
          {data?.getWorkflowRuns.workflow_runs.map((workflow) => {
            return (
              <WorkflowRunCard key={workflow.workflow_id} data={workflow} />
            );
          })}
        </RecentOverviewContainer>
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
      <OverviewContainer
        count={agentCount}
        countUnit={t('homeViews.agentConfiguredHome.agentInfoContainer.agent')}
        description={t(
          'homeViews.agentConfiguredHome.agentInfoContainer.description'
        )}
        maxWidth="25.5625rem"
        button={
          <>
            <ButtonOutlined
              onClick={handleOpen}
              className={classes.infoContainerButton}
            >
              <Typography>
                <ArrowUpwardIcon />
                {t('homeViews.agentConfiguredHome.agentInfoContainer.deploy')}
              </Typography>
            </ButtonOutlined>

            <Modal
              height="50%"
              width="50%"
              open={modalOpen}
              onClose={handleClose}
              modalActions={
                <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
              }
            >
              <AgentDeployModal handleClose={handleClose} />
            </Modal>
          </>
        }
      />

      {/* Project Level info container */}
      {projectRole === Role.owner && <ProjectInfoContainer />}
    </div>
  );
};

export { AgentConfiguredHome };
