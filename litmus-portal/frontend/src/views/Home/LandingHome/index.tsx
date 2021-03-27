import { useQuery } from '@apollo/client';
import { IconButton, Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateWorkflowCard } from '../../../components/CreateWorkflowCard';
import { LocalQuickActionCard } from '../../../components/LocalQuickActionCard';
import { GET_CLUSTER, LIST_PROJECTS } from '../../../graphql';
import { Clusters, ClusterVars } from '../../../models/graphql/clusterData';
import { Member, Project, Projects } from '../../../models/graphql/user';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getUserId } from '../../../utils/auth';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const LandingHome: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);

  const userID = getUserId();

  const [projectOwnerCount, setProjectOwnerCount] = useState<number>(0);
  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);

  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    let projectOwner = 0;
    let projectInvitation = 0;
    let projectOther = 0;
    projects.forEach((project) => {
      project.members.forEach((member: Member) => {
        if (member.user_id === userID && member.role === 'Owner') {
          projectOwner++;
        } else if (
          member.user_id === userID &&
          member.invitation === 'Pending'
        ) {
          projectInvitation++;
        } else if (
          member.user_id === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          projectOther++;
        }
      });
    });
    setProjectOwnerCount(projectOwner);
    setInvitationCount(projectInvitation);
    setProjectOtherCount(projectOther);
  }, [projects, dataProject]);

  // Apollo query to get the agent data
  const { data: agentList } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
    variables: { project_id: getProjectID() },
    fetchPolicy: 'network-only',
  });

  return (
    <>
      {/* Row 1 */}
      <div className={classes.firstRow}>
        <Paper className={classes.mainDiv}>
          <div className={classes.paperContent}>
            <Typography className={classes.mainHeading}>
              <strong>{t('home.subHeading1')}</strong>
            </Typography>
            <Typography className={classes.mainResult}>
              <strong>{t('home.subHeading2')}</strong>
            </Typography>
            {!(agentList && agentList.getCluster.length > 0) && (
              <Typography className={classes.warningText}>
                {t('home.NonAdmin.noAgent')}
              </Typography>
            )}
            {!(agentList && agentList.getCluster.length > 0) ? (
              <Typography className={classes.mainDesc}>
                {t('home.NonAdmin.agentDeployInfo')}
              </Typography>
            ) : (
              <Typography className={classes.mainDesc}>
                {t('home.subHeading3')}
              </Typography>
            )}
            {agentList && agentList.getCluster.length > 0 && (
              <div className={classes.predefinedBtn}>
                <ButtonFilled
                  variant="success"
                  onClick={() => {
                    tabs.changeWorkflowsTabs(2);
                    history.push({
                      pathname: '/workflows',
                      search: `?projectID=${getProjectID()}&projectRole=${getProjectRole()}`,
                    });
                  }}
                >
                  <Typography variant="subtitle1">
                    {t('home.button1')}
                  </Typography>
                </ButtonFilled>
              </div>
            )}
          </div>
          {!(agentList && agentList.getCluster.length > 0) ? (
            <div className={classes.imageDiv}>
              <img src="./icons/NoAgentAlert.svg" alt="No Agent Found" />
            </div>
          ) : (
            <div className={classes.imageDiv}>
              <img src="icons/applause.png" alt="Applause icon" />
            </div>
          )}
        </Paper>
        <div className={classes.workflowCard}>
          <CreateWorkflowCard
            isDisabled={agentList ? agentList.getCluster.length <= 0 : true}
            data-cy="CreateWorkflowCard"
          />
        </div>
      </div>
      {/* Row 2 */}
      <div className={classes.secondRow}>
        {/* First Card */}
        <Paper className={classes.rowTwoPaper}>
          <Typography id="agentText">
            {t('home.NonAdmin.chaosAgent')}
          </Typography>
          <div className={classes.agentFlex}>
            <Typography className={classes.agentCount}>
              {agentList?.getCluster.length}
            </Typography>
            <Typography>
              {agentList?.getCluster.length !== 1
                ? t('home.NonAdmin.agents')
                : t('home.NonAdmin.agent')}
            </Typography>
            <div className={classes.agentDesc}>
              <Typography>{t('home.NonAdmin.chaosAgentInfo')}</Typography>
            </div>
          </div>
          <ButtonFilled
            onClick={() => {
              history.push({
                pathname: '/targets',
                search: `?projectID=${getProjectID()}&projectRole=${getProjectRole()}`,
              });
            }}
          >
            {t('home.NonAdmin.deployFirst')}
          </ButtonFilled>
        </Paper>
        {/* Second Card */}
        <Paper id="rowTwoSecondPaper" className={classes.rowTwoPaper}>
          <div className={classes.flexEnd}>
            <div className={classes.invitationBoxFlex}>
              {t('settings.teamingTab.invitations')}
              <Typography>{invitationsCount}</Typography>
            </div>
          </div>
          <div className={classes.projectInfoProjectStats}>
            <Typography>{projectOtherCount + projectOwnerCount}</Typography>
            {projectOtherCount + projectOwnerCount > 1 ? (
              <Typography>{t('settings.teamingTab.projects')}</Typography>
            ) : (
              <Typography>{t('settings.teamingTab.project')}</Typography>
            )}
          </div>
          <div className={classes.flexEnd}>
            {t('home.NonAdmin.toProjects')}
            <IconButton
              onClick={() => {
                tabs.changeSettingsTabs(1);
                history.push({
                  pathname: '/settings',
                  search: `?projectID=${getProjectID()}&projectRole=${getProjectRole()}`,
                });
              }}
            >
              <img src="./icons/goToIcon.svg" alt="go to" />
            </IconButton>
          </div>
        </Paper>
        <LocalQuickActionCard
          className={classes.quickActionCard}
          variant="homePage"
        />
      </div>
    </>
  );
};

export default LandingHome;
