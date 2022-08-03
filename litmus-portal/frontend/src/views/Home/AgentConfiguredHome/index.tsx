import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonFilled, ButtonOutlined, Modal, TextButton } from 'litmus-ui';
import React, { lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { MainInfoContainer } from '../../../components/MainInfoContainer';
import { OverviewContainer } from '../../../components/OverviewContainer';
import { RecentOverviewContainer } from '../../../components/RecentOverviewContainer';
import Center from '../../../containers/layouts/Center';
import { WORKFLOW_DETAILS } from '../../../graphql';
import { Role } from '../../../models/graphql/user';
import {
  Workflow,
  WorkflowDataRequest,
} from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const WorkflowRunCard = lazy(() => import('./WorkflowRunCard'));
const ProjectInfoContainer = lazy(() => import('../ProjectInfoContainer'));
const AgentDeployModal = lazy(
  () => import('../../../components/AgentDeployModal')
);

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

  const { data, loading, error } = useQuery<Workflow, WorkflowDataRequest>(
    WORKFLOW_DETAILS,
    {
      variables: {
        request: {
          projectID,
          pagination: {
            page: 0,
            limit: 3,
          },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const workflowRunCount = data?.listWorkflowRuns.totalNoOfWorkflowRuns ?? 0;

  if (error) {
    console.error('Error fetching Chaos Scenario Data');
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
            <TextButton
              className={classes.textButton}
              variant="highlight"
              onClick={() => {
                tabs.changeWorkflowsTabs(0);
                history.push({
                  pathname: '/scenarios',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>
                {t('homeViews.agentConfiguredHome.recentWorkflowRuns.viewAll')}
              </Typography>
            </TextButton>
          }
          buttonLink="/create-scenario"
          buttonImgSrc="./icons/calendarBlank.svg"
          buttonImgAlt="calendar"
          buttonText={t(
            'homeViews.agentConfiguredHome.recentWorkflowRuns.schedule'
          )}
        >
          {data?.listWorkflowRuns.workflowRuns.map((workflow) => {
            return (
              <WorkflowRunCard key={workflow.workflowRunID} data={workflow} />
            );
          })}
        </RecentOverviewContainer>
      ) : (
        <MainInfoContainer
          src="./icons/workflowScheduleHome.svg"
          alt="Schedule a Chaos Scenario"
          heading={t('homeViews.agentConfiguredHome.noWorkflow.heading')}
          description={t(
            'homeViews.agentConfiguredHome.noWorkflow.description'
          )}
          button={
            <ButtonFilled
              onClick={() => {
                history.push({
                  pathname: '/create-scenario',
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
            <TextButton
              variant="highlight"
              onClick={() => {
                tabs.changeHubTabs(0);
                history.push({
                  pathname: '/myhub/Litmus%20ChaosHub',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              <Typography>
                {t('homeViews.agentConfiguredHome.noWorkflow.explore')}
              </Typography>
            </TextButton>
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
      {projectRole === Role.OWNER && <ProjectInfoContainer />}
    </div>
  );
};

export default AgentConfiguredHome;
