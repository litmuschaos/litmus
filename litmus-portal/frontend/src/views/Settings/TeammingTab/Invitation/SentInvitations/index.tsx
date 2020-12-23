import { useQuery } from '@apollo/client/react/hooks';
import {
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GET_USER } from '../../../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
} from '../../../../../models/graphql/user';
import { RootState } from '../../../../../redux/reducers';
import useStyles from './styles';
import TableData from './TableData';

const SentInvitations: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // for response data
  const [rows, setRows] = useState<Member[]>([]);

  const userData = useSelector((state: RootState) => state.userData);

  // query for getting all the data for the logged in user
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    {
      variables: { username: userData.username },
      fetchPolicy: 'cache-and-network',
    }
  );

  let memberList: Member[];
  const users: Member[] = [];
  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      const projectList = data?.getUser.projects;

      projectList.forEach((project) => {
        if (project.id === userData.selectedProjectID) {
          memberList = project.members;
        }
      });

      if (memberList) {
        memberList.forEach((member) => {
          if (
            member.invitation === 'Pending' ||
            member.invitation === 'Declined'
          ) {
            users.push(member);
          }
          setRows(users);
        });
      }
    }
  }, [data, userData.selectedProjectID]);

  return (
    <div>
      <TableContainer className={classes.table}>
        <Table>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.user_name}>
                <TableData row={row} />
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>
                <Typography>
                  {t('settings.teamingTab.invitation.sentInvitation.noInvites')}
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
