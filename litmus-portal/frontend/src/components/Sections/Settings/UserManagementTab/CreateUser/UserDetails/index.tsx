import { Avatar, Typography } from '@material-ui/core';
import React from 'react';
import InputField from '../../../../../../containers/layouts/InputField';
import userAvatar from '../../../../../../utils/user';
import useStyles from './styles';
import {
  validateOnlyAlphabet,
  validateEmail,
} from '../../../../../../utils/validate';

interface PersonalDetailsProps {
  handleNameChange?: (event: React.ChangeEvent<{ value: string }>) => void;
  nameValue: string;
  handleUserChange?: (event: React.ChangeEvent<{ value: string }>) => void;
  userValue: string;
  handleEmailChange?: (event: React.ChangeEvent<{ value: string }>) => void;
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
              validationError={validateOnlyAlphabet(nameValue)}
              label="Full Name"
            />

            <InputField
              required
              type="email"
              value={emailValue}
              disabled={emailIsDisabled}
              handleChange={handleEmailChange}
              validationError={validateEmail(emailValue)}
              label="Email Address"
            />
            {/* Username is not editable normal user */}
            <InputField
              value={userValue}
              handleChange={handleUserChange}
              label="Username"
              disabled={usernameIsDisabled}
              validationError={false}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
