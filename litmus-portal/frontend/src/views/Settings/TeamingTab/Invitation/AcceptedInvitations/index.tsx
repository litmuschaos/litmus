import { useMutation, useQuery } from '@apollo/client';
import { Paper, Typography } from '@material-ui/core';
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
import { getUserId, getUserRole } from '../../../../../utils/auth';
import { getProjectID } from '../../../../../utils/getSearchParams';
import useStyles from './styles';

const AcceptedInvitations: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userID = getUserId();
  const [projectOther, setProjectOther] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
  });
  // const userData = useSelector((state: RootState) => state.userData);
  const projectID = getProjectID();

  // stores the user who has left the project
  const [exitedMember, setExitedMember] = useState<string>('');

  const [leaveProject] = useMutation<MemberInvitation>(LEAVE_PROJECT, {
    onCompleted: () => {
      setProjectOther(projectOther.filter((row) => row.id !== exitedMember));
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

  // const setSelectedProjectID = (selectedProjectID: string) => {
  //   return dataProject?.listProjects.forEach((project) => {
  //     if (selectedProjectID === project.id) {
  //       const memberList: Member[] = project.members;

  //       memberList.forEach((member) => {
  //         if (member.user_id === userID) {
  //           user.updateUserDetails({
  //             selectedProjectID,
  //             userRole: member.role,
  //             selectedProjectName: project.name,
  //           });
  //           // Flush data to persistor immediately
  //           persistor.flush();

  //           if (member.role !== 'Owner') {
  //             history.push('/');
  //           }
  //         }
  //       });
  //     }
  //   });
  // };

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
                <img src="./icons/litmus-icon.svg" alt="chaos" />
                <Typography className={classes.projectName}>
                  {project.name}
                </Typography>
                {/* <IconButton onClick={() => setSelectedProjectID(project.id)}> */}
                <Typography className={classes.viewProject}>
                  {/* TODO:: Add translation */}
                  View Project
                </Typography>
                {/* </IconButton> */}
              </div>
              <div className={classes.buttonDiv}>
                <div data-cy="LeaveProject">
                  <ButtonFilled
                    className={classes.leaveProjectBtn}
                    onClick={() => {
                      // TODO: CHECK if same project.id as in URL
                      setExitedMember(project.id);
                      leaveProject({
                        variables: {
                          data: {
                            project_id: project.id,
                            user_id: getUserId(),
                            role: getUserRole(),
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
