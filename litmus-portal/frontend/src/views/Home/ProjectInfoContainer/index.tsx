import { useQuery } from '@apollo/client';
import { Paper, Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { LIST_PROJECTS } from '../../../graphql';
import { Member, Project, Projects } from '../../../models/graphql/user';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getUserId } from '../../../utils/auth';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const ProjectInfoContainer: React.FC = () => {
  const classes = useStyles();
  // const { t } = useTranslation();
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
                <Typography>Project</Typography>
              ) : (
                <Typography>Projects</Typography>
              )}
            </div>
            <div>
              <Typography id="invitationCount">{invitationsCount}</Typography>
              {invitationsCount === 1 ? (
                <Typography>Invitation</Typography>
              ) : (
                <Typography>Invitations</Typography>
              )}
            </div>
          </div>
        </div>
        {projectRole === 'Owner' && (
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
              View all projects
            </Typography>
          </ButtonOutlined>
        )}
      </Paper>
    </div>
  );
};

export { ProjectInfoContainer };
