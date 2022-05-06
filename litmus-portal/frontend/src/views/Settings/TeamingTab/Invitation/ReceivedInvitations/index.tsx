import { Avatar, Paper, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../../config';
import { Member, Project } from '../../../../../models/graphql/user';
import { getToken, getUserId } from '../../../../../utils/auth';
import { userInitials } from '../../../../../utils/userInitials';
import useStyles from './styles';

interface ReceivedInvitation {
  projectName: string;
  user_id: string;
  role: string;
  projectID: string;
  user_name: string;
}

interface ReceivedInvitationsProps {
  fetchData: () => void;
  getProjectDetail: () => void;
}

const ReceivedInvitations: React.FC<ReceivedInvitationsProps> = ({
  fetchData,
  getProjectDetail,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  // for response data
  const [rows, setRows] = useState<ReceivedInvitation[]>([]);

  // stores the user whose invitation is accepted/declined
  const [acceptDecline, setAcceptDecline] = useState<string>('');

  const userID = getUserId();

  const getProjects = () => {
    setLoading(true);
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
          setProjectList(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getProjects();
  }, []);
  const acceptInvite = (projectid: string, userid: string, role: string) => {
    fetch(`${config.auth.url}/accept_invitation`, {
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
          console.error(data.data.error);
        } else {
          setRows(rows.filter((row) => row.user_id !== acceptDecline));
          getProjects();
          fetchData();
          getProjectDetail();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const declineInvite = (projectid: string, userid: string, role: string) => {
    fetch(`${config.auth.url}/decline_invitation`, {
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
          setRows(rows.filter((row) => row.user_id !== acceptDecline));
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
    const users: ReceivedInvitation[] = [];

    let flag = 0;
    let roleVar = '';

    projectList.forEach((project: Project) => {
      const projectMembers = project.Members;
      if (projectMembers) {
        projectMembers.forEach((member: Member) => {
          if (member.UserID === userID && member.Invitation === 'Pending') {
            flag = 1;
            roleVar = member.Role;
          }
        });
        if (flag === 1) {
          projectMembers.forEach((member: Member) => {
            if (member.UserID !== userID && member.Role === 'Owner') {
              users.push({
                projectID: project.ID,
                projectName: project.Name,
                role: roleVar,
                user_id: member.UserID,
                user_name: member.UserName,
              });
            }
          });
          flag = 0;
        }
      }
    });
    setRows([...users]);
  }, [projectList]);

  return (
    <div data-cy="receivedInvitationModal">
      {!loading ? (
        <>
          {rows.length > 0 ? (
            rows.map((row) => (
              <Paper className={classes.root} key={`${row}`}>
                <div className={classes.avatarDiv}>
                  <Avatar
                    data-cy="avatar"
                    alt="User"
                    className={classes.avatarBackground}
                    style={{ alignContent: 'right' }}
                  >
                    {userInitials(row.user_name)}
                  </Avatar>
                  <div>
                    <Typography className={classes.name}>
                      {row.user_name}
                    </Typography>
                    <Typography className={classes.email}>
                      {t(
                        'settings.teamingTab.invitation.receivedInvitation.inviteTextFirst'
                      )}{' '}
                      {row.role === 'Editor' ? 'an' : 'a'}{' '}
                      <strong>{row.role}</strong>{' '}
                      {t(
                        'settings.teamingTab.invitation.receivedInvitation.inviteTextSecond'
                      )}
                    </Typography>
                  </div>
                </div>
                <div className={classes.projectDiv}>
                  <Typography className={classes.projectName}>
                    {row.projectName}
                  </Typography>
                </div>
                <div className={classes.buttonDiv}>
                  <ButtonOutlined
                    className={classes.butnOutline}
                    onClick={() => {
                      setAcceptDecline(row.user_id);
                      declineInvite(row.projectID, getUserId(), row.role);
                    }}
                    disabled={false}
                  >
                    <div>
                      {t(
                        'settings.teamingTab.invitation.receivedInvitation.button.ignore'
                      )}
                    </div>
                  </ButtonOutlined>
                  <div data-cy="receivedInvitationAccept">
                    <ButtonFilled
                      onClick={() => {
                        setAcceptDecline(row.user_id);
                        acceptInvite(row.projectID, getUserId(), row.role);
                      }}
                      disabled={false}
                    >
                      {t(
                        'settings.teamingTab.invitation.receivedInvitation.button.accept'
                      )}
                    </ButtonFilled>
                  </div>
                </div>{' '}
              </Paper>
            ))
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ReceivedInvitations;
