import { useMutation, useQuery } from '@apollo/client/react/hooks';
import {
  Avatar,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ACCEPT_INVITE,
  DECLINE_INVITE,
  GET_USER,
} from '../../../../../../graphql';
import { Project } from '../../../../../../models/project';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../../../models/user';
import { RootState } from '../../../../../../redux/reducers';
import userAvatar from '../../../../../../utils/user';
import ButtonFilled from '../../../../../Button/ButtonFilled';
import ButtonOutline from '../../../../../Button/ButtonOutline';
import useStyles from './styles';

interface ReceivedInvitation {
  projectName: string;
  username: string;
  role: string;
  projectID: string;
}

const ReceivedInvitations: React.FC = () => {
  const classes = useStyles();

  // for response data
  const [rows, setRows] = useState<ReceivedInvitation[]>([]);

  const { userData } = useSelector((state: RootState) => state);

  // stores the user whose invitation is accepted/declined
  const [acceptDecline, setAcceptDecline] = useState<string>('');

  // mutation to accept the invitation
  const [acceptInvite] = useMutation(ACCEPT_INVITE, {
    onCompleted: () => {
      setRows(
        rows.filter(function (row) {
          return row.username !== acceptDecline;
        })
      );
    },
    onError: () => {},
    refetchQueries: [
      { query: GET_USER, variables: { username: userData.username } },
    ],
  });

  // mutation to decline the invitation
  const [declineInvite] = useMutation(DECLINE_INVITE, {
    onCompleted: () => {
      setRows(
        rows.filter(function (row) {
          return row.username !== acceptDecline;
        })
      );
    },
    onError: () => {},
    refetchQueries: [
      { query: GET_USER, variables: { username: userData.username } },
    ],
  });

  // query for getting all the data for the logged in user
  const { data, loading } = useQuery<
    CurrentUserDetails,
    CurrentUserDedtailsVars
  >(GET_USER, {
    variables: { username: userData.username },
  });

  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      const projectList: Project[] = data?.getUser.projects;
      let users: ReceivedInvitation[] = [];

      let flag = 0;

      projectList.forEach((project) => {
        project.members.forEach((member) => {
          if (
            member.user_name === userData.username &&
            member.role !== 'Owner' &&
            member.invitation === 'Pending'
          ) {
            flag = 1;
          }
        });
        if (flag === 1) {
          project.members.forEach((member) => {
            if (
              member.user_name !== userData.username &&
              member.role === 'Owner'
            ) {
              users = users.concat(rows, {
                username: member.user_name,
                role: member.role,
                projectName: project.name,
                projectID: project.id,
              });
            }
          });
          flag = 0;
        }
      });

      setRows(users);
    }
  }, [loading]);
  return (
    <div>
      <TableContainer className={classes.table}>
        <Table>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.username}>
                <TableCell>
                  <div className={classes.rowDiv}>
                    <div className={classes.firstCol}>
                      <Avatar
                        data-cy="avatar"
                        alt="User"
                        className={classes.avatarBackground}
                        style={{ alignContent: 'right' }}
                      >
                        {row.username.split(' ')[1]
                          ? userAvatar(row.username, false)
                          : userAvatar(row.username, true)}
                      </Avatar>
                      <div className={classes.detail}>
                        <div> {row.username}</div>
                        <div>{row.projectName}</div>
                      </div>
                    </div>
                    <div className={classes.buttonDiv}>
                      <ButtonOutline
                        handleClick={() => {
                          setAcceptDecline(row.username);
                          declineInvite({
                            variables: {
                              member: {
                                project_id: row.projectID,
                                user_name: userData.username,
                              },
                            },
                          });
                        }}
                        isDisabled={false}
                      >
                        <div>Ignore</div>
                      </ButtonOutline>
                      <ButtonFilled
                        isPrimary={false}
                        handleClick={() => {
                          setAcceptDecline(row.username);
                          acceptInvite({
                            variables: {
                              member: {
                                project_id: row.projectID,
                                user_name: userData.username,
                              },
                            },
                          });
                        }}
                        isDisabled={false}
                      >
                        <div>Accept</div>
                      </ButtonFilled>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                <Typography align="center">No users available.</Typography>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
    </div>
  );
};

export default ReceivedInvitations;
