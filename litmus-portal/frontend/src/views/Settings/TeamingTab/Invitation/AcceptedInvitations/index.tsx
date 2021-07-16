import { useMutation, useQuery } from '@apollo/client';
import { IconButton, Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GET_PROJECT,
  LEAVE_PROJECT,
  LIST_PROJECTS,
} from '../../../../../graphql';
import { MemberInvitation } from '../../../../../models/graphql/invite';
import { Member, Project, Projects } from '../../../../../models/graphql/user';
import { history } from '../../../../../redux/configureStore';
import { getUserId } from '../../../../../utils/auth';
import { getProjectID } from '../../../../../utils/getSearchParams';
import useStyles from './styles';

interface OtherProjectsType {
  projectDetails: Project;
  currentUserProjectRole: string;
}

const AcceptedInvitations: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userID = getUserId();
  const [projectOther, setProjectOther] = useState<OtherProjectsType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
    fetchPolicy: 'cache-and-network',
  });
  const projectID = getProjectID();

  // stores the user who has left the project
  const [exitedMember, setExitedMember] = useState<string>('');

  const [leaveProject] = useMutation<MemberInvitation>(LEAVE_PROJECT, {
    onCompleted: () => {
      setProjectOther(
        projectOther.filter((row) => row.projectDetails.id !== exitedMember)
      );
    },
    refetchQueries: [
      {
        query: GET_PROJECT,
        variables: { projectID },
      },
      { query: LIST_PROJECTS },
    ],
  });

  useEffect(() => {
    const otherProject: OtherProjectsType[] = [];
    projects.map((project) => {
      return project.members.forEach((member: Member) => {
        if (
          member.user_id === userID &&
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
            data-cy="receivedInvitationModal"
            className={classes.rootDiv}
            key={`${project}`}
          >
            <Paper className={classes.root}>
              <div className={classes.projectDiv}>
                <Typography className={classes.projectName}>
                  {project.projectDetails.name}
                </Typography>
                <IconButton
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
              <Typography className={classes.projectRole}>
                {t('settings.teamingTab.invitation.acceptedInvitation.role')}:{' '}
                {project.currentUserProjectRole}
              </Typography>
              <div className={classes.buttonDiv}>
                <div data-cy="LeaveProject">
                  <ButtonFilled
                    className={classes.leaveProjectBtn}
                    onClick={() => {
                      setExitedMember(project.projectDetails.id);
                      leaveProject({
                        variables: {
                          data: {
                            project_id: project.projectDetails.id,
                            user_id: getUserId(),
                            role: project.currentUserProjectRole,
                          },
                        },
                      });
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
