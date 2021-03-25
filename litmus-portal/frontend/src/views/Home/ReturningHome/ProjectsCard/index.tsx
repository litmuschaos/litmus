import { IconButton, Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../../../../models/graphql/user';
import useStyles from './styles';

const ProjectCard: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [projectOwnerCount, setProjectOwnerCount] = useState<number>(0);
  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);

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
        <IconButton className={classes.goToIcon}>
          <img src="./icons/goToIcon.svg" alt="go to" />
        </IconButton>
      </div>
    </Paper>
  );
};

export default ProjectCard;
