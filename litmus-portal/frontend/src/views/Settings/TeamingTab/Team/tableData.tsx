import { useQuery } from '@apollo/client';
import { Avatar, IconButton, TableCell } from '@material-ui/core';
import moment from 'moment';
import React, { useState } from 'react';
import { GET_USER } from '../../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Role,
} from '../../../../models/graphql/user';
import { CurrentUserData } from '../../../../models/userData';
import { userInitials } from '../../../../utils/userInitials';
import RemoveMemberModal from './removeMemberModal';
import useStyles from './styles';

interface TableDataProps {
  row: Member;
  index: number;
  showModal: () => void;
}
const TableData: React.FC<TableDataProps> = ({ row, showModal }) => {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);

  // Function to display date in format Do MMM,YYYY Hr:MM AM/PM
  const formatDate = (date: string) => {
    const day = moment(date).format('Do MMM, YYYY LT');
    return day;
  };

  const [memberDetails, setMemberDetails] = useState<CurrentUserData>();

  useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(GET_USER, {
    variables: { username: row.user_name },
    onCompleted: (data) => {
      setMemberDetails({
        name: data.getUser.name,
        uid: data.getUser.id,
        username: data.getUser.username,
        role: data.getUser.role,
        email: data.getUser.email,
      });
    },
  });
  return (
    <>
      <TableCell
        className={`${classes.firstTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
        component="th"
        scope="row"
      >
        <div className={classes.firstCol}>
          <Avatar
            data-cy="avatar"
            alt="User"
            className={`${
              row.deactivated_at ? classes.darkBg : classes.avatarBackground
            } `}
          >
            {userInitials(memberDetails ? memberDetails.username : '')}
          </Avatar>
          {memberDetails ? memberDetails.username : ''}
        </div>
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        {row.role}
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        {memberDetails ? memberDetails.email : ''}
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        <div className={classes.dateDiv}>
          <img
            className={classes.calIcon}
            src="./icons/calendarIcon.svg"
            alt="calendar"
          />
          {formatDate(row.joined_at)}
        </div>
      </TableCell>

      {row.role !== Role.owner ? (
        <TableCell
          className={`${classes.otherTC} ${
            row.deactivated_at ? classes.dark : ''
          }`}
          key={row.user_id}
        >
          <IconButton onClick={() => setOpen(true)}>
            <img alt="delete" src="./icons/removeMember.svg" height="50" />
          </IconButton>
        </TableCell>
      ) : (
        <TableCell
          className={`${classes.otherTC} ${
            row.deactivated_at ? classes.dark : ''
          }`}
        />
      )}
      {open && (
        <RemoveMemberModal
          open={open}
          handleClose={() => {
            setOpen(false);
          }}
          row={row}
          showModal={showModal}
          isRemove
        />
      )}
    </>
  );
};
export default TableData;
