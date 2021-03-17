import { useQuery } from '@apollo/client';
import { Avatar, IconButton, Popover, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { GET_USER_INFO } from '../../graphql';
import { CurrentUserDetails } from '../../models/graphql/user';
import {
  getUserEmail,
  getUsername,
  getUserName,
  logout,
} from '../../utils/auth';
import { userInitials } from '../../utils/user';
import useStyles from './styles';

const ProfileDropdown: React.FC = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Get username from JWT
  const username = getUsername();

  // Get userName from JWT
  const userNameToken = getUserName();

  // Get the userEmail from JWT
  const userEmailToken = getUserEmail();

  const [userName, setuserName] = useState<string>(userNameToken);
  const [userEmail, setuserEmail] = useState<string>(userEmailToken);

  // Run query to get the data in case it is not present in the JWT
  useQuery<CurrentUserDetails>(GET_USER_INFO, {
    skip: userName !== undefined && userEmail !== undefined,
    variables: { username },
    onCompleted: (data) => {
      setuserName(data.getUser.name);
      setuserEmail(data.getUser.email);
    },
  });

  // Handle clicks
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'headerProfileDropdown' : undefined;

  const initials = userInitials(userName);

  return (
    <div className={classes.profileDropdown} data-cy="headerProfileDropdown">
      <IconButton edge="end" onClick={handleClick}>
        <Avatar>{initials}</Avatar>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={classes.profileDropdownPopover}>
          <div className={classes.profileInfo}>
            <Avatar>{initials}</Avatar>
            <div>
              <Typography id="userName">{username}</Typography>
              <Typography>{userEmail}</Typography>
            </div>
          </div>
          <ButtonFilled fullWidth onClick={() => logout()}>
            Logout
            <img id="logoutIcon" src="./icons/logout.svg" alt="logout" />
          </ButtonFilled>
        </div>
      </Popover>
    </div>
  );
};

export default ProfileDropdown;
