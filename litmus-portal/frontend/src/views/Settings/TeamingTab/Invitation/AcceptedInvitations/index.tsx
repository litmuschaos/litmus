import { useMutation, useQuery } from '@apollo/client';
import { IconButton, Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  GET_PROJECT,
  LEAVE_PROJECT,
  LIST_PROJECTS,
} from '../../../../../graphql';
import { MemberInvitation } from '../../../../../models/graphql/invite';
import { Member, Project, Projects } from '../../../../../models/graphql/user';
import useActions from '../../../../../redux/actions';
import * as UserActions from '../../../../../redux/actions/user';
import configureStore, { history } from '../../../../../redux/configureStore';
import { RootState } from '../../../../../redux/reducers';
import { getUserId, getUsername } from '../../../../../utils/auth';
import useStyles from './styles';

const AcceptedInvitations: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { persistor } = configureStore();

  const userID = getUserId();
  const user = useActions(UserActions);
  const [projectOther, setProjectOther] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
  });
  const userData = useSelector((state: RootState) => state.userData);

  // stores the user who has left the project
  const [exitedMember, setExitedMember] = useState<string>('');

  const [leaveProject] = useMutation<MemberInvitation>(LEAVE_PROJECT, {
    onCompleted: () => {
      setProjectOther(projectOther.filter((row) => row.id !== exitedMember));
    },
    refetchQueries: [
      {
        query: GET_PROJECT,
        variables: { projectID: userData.selectedProjectID },
      },
      { query: LIST_PROJECTS },
    ],
  });

  useEffect(() => {
    const otherProject: Project[] = [];
    projects.map((project) => {
      return project.members.forEach((member: Member) => {
        if (
          member.user_id === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          otherProject.push(project);
        }
      });
    });
    setProjectOther([...otherProject]);
  }, [projects]);

  const setSelectedProjectID = (selectedProjectID: string) => {
    return dataProject?.listProjects.forEach((project) => {
      if (selectedProjectID === project.id) {
        const memberList: Member[] = project.members;

        memberList.forEach((member) => {
          if (member.user_id === userID) {
            user.updateUserDetails({
              selectedProjectID,
              userRole: member.role,
              selectedProjectName: project.name,
            });
            // Flush data to persistor immediately
            persistor.flush();

            if (member.role !== 'Owner') {
              history.push('/');
            }
          }
        });
      }
    });
  };

  return (
    <>
      {projectOther.length ? (
        projectOther.map((project) => (
          <div data-cy="receivedInvitationModal" className={classes.rootDiv}>
            <Paper className={classes.root}>
              <div className={classes.projectDiv}>
                <img src="./icons/litmus-icon.svg" alt="chaos" />
                <Typography className={classes.projectName}>
                  {project.name}
                </Typography>
                <IconButton onClick={() => setSelectedProjectID(project.id)}>
                  <Typography className={classes.viewProject}>
                    View Project
                  </Typography>
                </IconButton>
              </div>
              <div className={classes.buttonDiv}>
                <div data-cy="LeaveProject">
                  <ButtonFilled
                    className={classes.leaveProjectBtn}
                    onClick={() => {
                      setExitedMember(project.id);
                      leaveProject({
                        variables: {
                          data: {
                            project_id: project.id,
                            user_name: getUsername(),
                            role: userData.userRole,
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
