import { useQuery } from '@apollo/client';
import { Paper, Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_PROJECTS } from '../../../graphql';
import {
  InvitationStatus,
  Member,
  Project,
  Projects,
  Role,
} from '../../../models/graphql/user';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getUserId } from '../../../utils/auth';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const ProjectInfoContainer: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);

  const userID = getUserId();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

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
        if (member.user_id === userID && member.role === Role.owner) {
          projectOwner++;
        } else if (
          member.user_id === userID &&
          member.invitation === InvitationStatus.PENDING
        ) {
          projectInvitation++;
        } else if (
          member.user_id === userID &&
          member.role !== Role.owner &&
          member.invitation === InvitationStatus.ACCEPTED
        ) {
          projectOther++;
        }
      });
    });
    setProjectOwnerCount(projectOwner);
    setInvitationCount(projectInvitation);
    setProjectOtherCount(projectOther);
  }, [projects, dataProject]);

  const projectCount = projectOwnerCount + projectOtherCount;

  return (
    <div>
      {/* Project Level info container */}
      <Paper className={classes.projectInfoContainer}>
        <div className={classes.projectInfoBlock}>
          <div className={classes.projectInfoData}>
            <div>
              <Typography id="projectCount">{projectCount}</Typography>
              {projectCount === 1 ? (
                <Typography>
                  {t('homeViews.projectInfoContainer.project')}
                </Typography>
              ) : (
                <Typography>
                  {t('homeViews.projectInfoContainer.projects')}
                </Typography>
              )}
            </div>
            <div>
              <Typography id="invitationCount">{invitationsCount}</Typography>
              {invitationsCount === 1 ? (
                <Typography>
                  {t('homeViews.projectInfoContainer.invitation')}
                </Typography>
              ) : (
                <Typography>
                  {t('homeViews.projectInfoContainer.invitations')}
                </Typography>
              )}
            </div>
          </div>
        </div>
        {projectRole === Role.owner && (
          <ButtonOutlined
            onClick={() => {
              tabs.changeSettingsTabs(1);
              history.push({
                pathname: '/settings',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            className={classes.viewProjectButton}
          >
            <Typography>
              <img src="./icons/viewProjects.svg" alt="View projects" />
              {t('homeViews.projectInfoContainer.viewProjects')}
            </Typography>
          </ButtonOutlined>
        )}
      </Paper>
    </div>
  );
};

export default ProjectInfoContainer;
