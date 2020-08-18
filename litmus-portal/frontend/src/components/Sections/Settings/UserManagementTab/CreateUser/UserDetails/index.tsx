import { Avatar, TextField, Typography } from '@material-ui/core';
import React from 'react';
import userAvatar from '../../../../../../utils/user';
import useStyles from './styles';

interface PersonalDetailsProps {
  handleNameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  nameValue: string;
  handleUserChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userValue: string;
  handleEmailChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emailValue: string;
  usernameIsDisabled: boolean;
  nameIsDisabled: boolean;
  emailIsDisabled: boolean;
}

// Displays the personals details on the "accounts" tab
const UserDetails: React.FC<PersonalDetailsProps> = ({
  handleNameChange,
  nameValue,
  handleUserChange,
  userValue,
  handleEmailChange,
  emailValue,
  usernameIsDisabled,
  nameIsDisabled,
  emailIsDisabled,
}) => {
  const classes = useStyles();

  const nameSplit = nameValue.split(' ');
  const initials = nameSplit[1]
    ? userAvatar(nameValue, false)
    : userAvatar(nameValue, true);

  return (
    <div>
      <Typography className={classes.headerText}>
        <strong> Personal Details</strong>
      </Typography>
      <form>
        <div className={classes.details}>
          <div className={classes.dp}>
            <Avatar
              data-cy="avatar"
              alt="User"
              className={classes.avatarBackground}
              style={{ alignContent: 'right' }}
            >
              {initials}
            </Avatar>
          </div>
          {/* Fields for details including Full name, email, username */}
          <div className={classes.details1}>
            <TextField
              required
              value={nameValue}
              disabled={nameIsDisabled}
              onChange={handleNameChange}
              className={classes.user}
              id="filled-user-input"
              label="Full Name"
              InputProps={{ disableUnderline: true }}
              data-cy="fullName"
            />

            <TextField
              required
              type="email"
              value={emailValue}
              disabled={emailIsDisabled}
              onChange={handleEmailChange}
              className={classes.user}
              id="filled-email-input"
              label="Email Address"
              name="email"
              InputProps={{
                disableUnderline: true,
              }}
              data-cy="inputEmail"
            />
            {/* Username is not editable normal user */}
            <TextField
              value={userValue}
              onChange={handleUserChange}
              className={classes.user}
              id="filled-username-input"
              label="Username"
              disabled={usernameIsDisabled}
              InputProps={{
                disableUnderline: true,
              }}
              data-cy="username"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
