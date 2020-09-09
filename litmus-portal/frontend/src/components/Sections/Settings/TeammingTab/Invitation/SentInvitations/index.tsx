import { useQuery } from '@apollo/client/react/hooks';
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
import { GET_USER } from '../../../../../../graphql';
import { Member, Project } from '../../../../../../models/project';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../../../models/user';
import { RootState } from '../../../../../../redux/reducers';
import userAvatar from '../../../../../../utils/user';
import ButtonFilled from '../../../../../Button/ButtonFilled';
import useStyles from './styles';

const SentInvitations: React.FC = () => {
  const classes = useStyles();
  // for response data
  const [rows, setRows] = useState<Member[]>([]);

  const { userData } = useSelector((state: RootState) => state);

  // query for getting all the data for the logged in user
  const { data, loading } = useQuery<
    CurrentUserDetails,
    CurrentUserDedtailsVars
  >(GET_USER, {
    variables: { username: userData.username },
  });

  let memberList: Member[];
  let users: Member[] = [];
  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      const projectList: Project[] = data?.getUser.projects;

      projectList.forEach((project) => {
        if (project.id === userData.selectedProjectID) {
          memberList = project.members;
        }
      });

      memberList.forEach((member) => {
        if (member.invitation === 'Pending') {
          users = users.concat(rows, member);
        }
        setRows(users);
      });
    }
  }, [loading]);

  return (
    <div>
      <TableContainer className={classes.table}>
        <Table>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.user_name}>
                <TableCell>
                  <div className={classes.rowDiv}>
                    <div className={classes.firstCol}>
                      <Avatar
                        data-cy="avatar"
                        alt="User"
                        className={classes.avatarBackground}
                        style={{ alignContent: 'right' }}
                      >
                        {row.user_name.split(' ')[1]
                          ? userAvatar(row.user_name, false)
                          : userAvatar(row.user_name, true)}
                      </Avatar>
                      <div className={classes.detail}>
                        <div> {row.user_name}</div>
                        <div>{row.role}</div>
                      </div>
                    </div>
                    <div className={classes.buttonDiv}>
                      <ButtonFilled isPrimary handleClick={() => {}} isDisabled>
                        <div>Resend invite link </div>
                      </ButtonFilled>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                <Typography>
                  There is no one waiting for your invitation.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
    </div>
  );
};

export default SentInvitations;
