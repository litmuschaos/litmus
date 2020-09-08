import { Avatar, Typography } from '@material-ui/core';
import React from 'react';
import InputField from '../../../../../../containers/layouts/InputField';
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
            <InputField
              required
              value={nameValue}
              disabled={nameIsDisabled}
              handleChange={handleNameChange}
              id="filled-user-input"
              label="Full Name"
              data-cy="fullName"
            />

            <InputField
              required
              type="email"
              value={emailValue}
              disabled={emailIsDisabled}
              handleChange={handleEmailChange}
              id="filled-email-input"
              label="Email Address"
              name="email"
              data-cy="inputEmail"
            />
            {/* Username is not editable normal user */}
            <InputField
              value={userValue}
              handleChange={handleUserChange}
              id="filled-username-input"
              label="Username"
              disabled={usernameIsDisabled}
              data-cy="username"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
