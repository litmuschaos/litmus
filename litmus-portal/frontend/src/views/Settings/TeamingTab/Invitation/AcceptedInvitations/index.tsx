import { IconButton, Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../../config';
import { Member, Project } from '../../../../../models/graphql/user';
import { history } from '../../../../../redux/configureStore';
import { getToken, getUserId } from '../../../../../utils/auth';
import useStyles from './styles';

interface OtherProjectsType {
  projectDetails: Project;
  currentUserProjectRole: string;
}

interface AcceptedInvitationsProps {
  fetchData: () => void;
  getProjectDetail: () => void;
}

const AcceptedInvitations: React.FC<AcceptedInvitationsProps> = ({
  fetchData,
  getProjectDetail,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userID = getUserId();
  const [projectOther, setProjectOther] = useState<OtherProjectsType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const getProjects = () => {
    fetch(`${config.auth.url}/list_projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data.data);
        } else {
          setProjects(data.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getProjects();
  }, []);

  // stores the user who has left the project
  const [exitedMember, setExitedMember] = useState<string>('');

  const leaveProject = (projectid: string, userid: string, role: string) => {
    fetch(`${config.auth.url}/leave_project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        project_id: projectid,
        user_id: userid,
        role,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data.error);
        } else {
          setProjectOther(
            projectOther.filter((row) => row.projectDetails.id !== exitedMember)
          );
          getProjects();
          fetchData();
          getProjectDetail();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const otherProject: OtherProjectsType[] = [];
    projects.map((project) => {
      return project.members?.forEach((member: Member) => {
        if (
          member.userID === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          otherProject.push({
            projectDetails: project,
            currentUserProjectRole: member.role,
          });
        }
      });
    });
    setProjectOther([...otherProject]);
  }, [projects]);

  return (
    <>
      {projectOther.length ? (
        projectOther.map((project) => (
          <div
            data-cy="acceptedInvitationRow"
            className={classes.rootDiv}
            key={`${project}`}
          >
            <Paper className={classes.root}>
              <div className={classes.projectDiv}>
                <Typography
                  data-cy="acceptedProjectName"
                  className={classes.projectName}
                >
                  {project.projectDetails.name}
                </Typography>
                <IconButton
                  data-cy="viewAcceptedProject"
                  className={classes.viewProject}
                  onClick={() => {
                    history.push({
                      pathname: `/home`,
                      search: `?projectID=${project.projectDetails.id}&projectRole=${project.currentUserProjectRole}`,
                    });
                  }}
                >
                  <Typography>
                    {t(
                      'settings.teamingTab.invitation.acceptedInvitation.viewProject'
                    )}
                  </Typography>
                </IconButton>
              </div>
              <Typography
                data-cy="roleInAcceptedProject"
                className={classes.projectRole}
              >
                {t('settings.teamingTab.invitation.acceptedInvitation.role')}:{' '}
                {project.currentUserProjectRole}
              </Typography>
              <div className={classes.buttonDiv}>
                <div data-cy="leaveAcceptedProject">
                  <ButtonFilled
                    className={classes.leaveProjectBtn}
                    onClick={() => {
                      setExitedMember(project.projectDetails.id);
                      // leaveProject({
                      //   variables: {
                      //     data: {
                      //       project_id: project.projectDetails.id,
                      //       user_id: getUserId(),
                      //       role: project.currentUserProjectRole,
                      //     },
                      //   },
                      // });
                      leaveProject(
                        project.projectDetails.id,
                        getUserId(),
                        project.currentUserProjectRole
                      );
                    }}
                  >
                    {t(
                      'settings.teamingTab.invitation.receivedInvitation.button.leave'
                    )}
                  </ButtonFilled>
                </div>
              </div>
            </Paper>
          </div>
        ))
      ) : (
        <></>
      )}
    </>
  );
};

export default AcceptedInvitations;
