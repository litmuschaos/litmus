import { Avatar, Typography } from '@material-ui/core';
import React from 'react';
import InputField from '../../../../../components/InputField';
import userAvatar from '../../../../../utils/user';
import {
  validateEmail,
  validateStartEmptySpacing,
} from '../../../../../utils/validate';
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
  const initials = nameSplit[1] ? userAvatar(nameValue) : userAvatar(nameValue);

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
            <div data-cy="InputName">
              <InputField
                required
                helperText={
                  validateStartEmptySpacing(nameValue)
                    ? 'Should not start with an empty space'
                    : ''
                }
                value={nameValue}
                disabled={nameIsDisabled}
                handleChange={handleNameChange}
                validationError={validateStartEmptySpacing(nameValue)}
                label="Full Name"
              />
            </div>
            <div data-cy="InputEmail">
              <InputField
                required
                helperText={
                  validateEmail(emailValue) ? 'Should be a valid email' : ''
                }
                type="email"
                value={emailValue}
                disabled={emailIsDisabled}
                handleChange={handleEmailChange}
                validationError={validateEmail(emailValue)}
                label="Email Address"
              />
            </div>
            {/* Username is not editable normal user */}
            <div data-cy="username">
              <InputField
                value={userValue}
                handleChange={handleUserChange}
                label="Username"
                disabled={usernameIsDisabled}
                validationError={false}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
