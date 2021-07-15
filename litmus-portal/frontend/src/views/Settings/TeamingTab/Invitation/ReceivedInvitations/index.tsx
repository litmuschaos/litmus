import { useMutation, useQuery } from '@apollo/client';
import { Avatar, Paper, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ACCEPT_INVITE,
  DECLINE_INVITE,
  LIST_PROJECTS,
} from '../../../../../graphql';
import { MemberInvitation } from '../../../../../models/graphql/invite';
import { Projects } from '../../../../../models/graphql/user';
import { getUserId } from '../../../../../utils/auth';
import { userInitials } from '../../../../../utils/userInitials';
import useStyles from './styles';

interface ReceivedInvitation {
  projectName: string;
  user_id: string;
  role: string;
  projectID: string;
  user_name: string;
}

const ReceivedInvitations: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // for response data
  const [rows, setRows] = useState<ReceivedInvitation[]>([]);

  // stores the user whose invitation is accepted/declined
  const [acceptDecline, setAcceptDecline] = useState<string>('');

  const userID = getUserId();
  // mutation to accept the invitation
  const [acceptInvite] = useMutation<MemberInvitation>(ACCEPT_INVITE, {
    onCompleted: () => {
      setRows(rows.filter((row) => row.user_id !== acceptDecline));
    },
    refetchQueries: [{ query: LIST_PROJECTS }],
  });

  // mutation to decline the invitation
  const [declineInvite] = useMutation<MemberInvitation>(DECLINE_INVITE, {
    onCompleted: () => {
      setRows(rows.filter((row) => row.user_id !== acceptDecline));
    },
    refetchQueries: [{ query: LIST_PROJECTS }],
  });

  const { data, loading } = useQuery<Projects>(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const projectList = data?.listProjects ?? [];
    const users: ReceivedInvitation[] = [];

    let flag = 0;
    let roleVar = '';

    projectList.forEach((project) => {
      project.members.forEach((member) => {
        if (member.user_id === userID && member.invitation === 'Pending') {
          flag = 1;
          roleVar = member.role;
        }
      });
      if (flag === 1) {
        project.members.forEach((member) => {
          if (member.user_id !== userID && member.role === 'Owner') {
            users.push({
              projectID: project.id,
              projectName: project.name,
              role: roleVar,
              user_id: member.user_id,
              user_name: member.user_name,
            });
          }
        });
        flag = 0;
      }
    });
    setRows([...users]);
  }, [data]);

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
                      declineInvite({
                        variables: {
                          member: {
                            project_id: row.projectID,
                            user_id: getUserId(),
                            role: row.role,
                          },
                        },
                      });
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
                        acceptInvite({
                          variables: {
                            member: {
                              project_id: row.projectID,
                              user_id: getUserId(),
                              role: row.role,
                            },
                          },
                        });
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
