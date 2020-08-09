import { Avatar, TextField, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface PersonalDetailsProps {
  handleNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  nameValue: string;
  handleUserChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userValue: string;
  handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emailValue: string;
  usernameIsDisabled: boolean;
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
}) => {
  const classes = useStyles();

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
              alt="Richard Hill"
              src="./icons/avatar.png"
              className={classes.orange}
            >
              R
            </Avatar>
            <div>
              <label htmlFor="contained-button-file" id="editPic">
                <input
                  name="contained-button-file"
                  accept="image/*"
                  className={classes.input}
                  id="contained-button-file"
                  type="file"
                />
                <Typography className={classes.edit}>Edit Photo</Typography>
              </label>
            </div>
          </div>
          {/* Fields for details including Full name, email, username */}
          <div className={classes.details1}>
            <TextField
              required
              value={nameValue}
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
