import { useQuery } from '@apollo/client';
import { IconButton, Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_PROJECTS } from '../../../../graphql';
import { Member, Project, Projects } from '../../../../models/graphql/user';
import useActions from '../../../../redux/actions';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { getUserId } from '../../../../utils/auth';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

const ProjectCard: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userID = getUserId();
  const tabs = useActions(TabActions);

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

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
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
          className={classes.goToIcon}
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
  );
};

export default ProjectCard;
