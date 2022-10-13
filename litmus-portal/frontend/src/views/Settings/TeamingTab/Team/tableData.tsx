import { Avatar, IconButton, TableCell } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import config from '../../../../config';
import { Member, Role } from '../../../../models/graphql/user';
import { CurrentUserData } from '../../../../models/userData';
import { getToken } from '../../../../utils/auth';
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
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY, HH:mm');
    return resDate;
  };

  const [memberDetails, setMemberDetails] = useState<CurrentUserData>();

  useEffect(() => {
    fetch(`${config.auth.url}/getUser/${row.UserID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMemberDetails({
          // TODO: Check if all are being used
          name: data.first_name,
          uid: data._id,
          username: data.username,
          role: data.role,
          email: data.email,
        });
      });
  }, []);

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
            {memberDetails?.username && userInitials(memberDetails.username)}
          </Avatar>
          {memberDetails ? memberDetails.username : ''}
        </div>
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        {row.Role}
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
          {formatDate(row.JoinedAt)}
        </div>
      </TableCell>

      {row.Role !== Role.OWNER ? (
        <TableCell
          className={`${classes.otherTC} ${
            row.deactivated_at ? classes.dark : ''
          }`}
          key={row.UserID}
        >
          <IconButton data-cy="removeMember" onClick={() => setOpen(true)}>
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
