import { Button, Divider, Typography } from '@material-ui/core';
import React, { useRef } from 'react';
import InputField from '../../../../../containers/layouts/InputField';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import {
  validateConfirmPassword,
  validateStartEmptySpacing,
} from '../../../../../utils/validate';
import PersonalDetails from '../PersonalDetails';
import useStyles from './styles';

// used for password field
interface Password {
  password: string;
  showPassword: boolean;
}

// AccountSettings displays the starting page of "Accounts" tab
const AccountSettings: React.FC = () => {
  const classes = useStyles();

  // used for modal
  const [open, setOpen] = React.useState(false);
  const isSuccess = useRef<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  // states for the three password fields
  const [currPassword, setCurrPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
  });
  const [newPassword, setNewPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
  });
  const [confNewPassword, setConfNewPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
  });

  // handleCurrPassword handles password for first password field
  const handleCurrPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrPassword({
      ...currPassword,
      [prop]: event.target.value,
    });
  };

  // handleNewPassword handles password for second password field
  const handleNewPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPassword({
      ...newPassword,
      [prop]: event.target.value,
    });
  };

  // handleConfPassword handles password for third password field
  const handleConfPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfNewPassword({
      ...confNewPassword,
      [prop]: event.target.value,
    });
  };

  if (
    confNewPassword.password.length > 0 &&
    newPassword.password === confNewPassword.password
  )
    isSuccess.current = true;
  else isSuccess.current = false;

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.suSegments}>
          {/* Below component renders the upper section of the page, displays personal details */}
          <PersonalDetails />
          <Divider className={classes.divider} />

          {/* Displays the lower segment containing the password details */}
          <Typography className={classes.headerText}>
            <strong>Password</strong>
          </Typography>
          <div className={classes.outerPass}>
            <form className={classes.innerPass}>
              {/* Current Password */}
              <InputField
                required
                value={currPassword.password}
                handleChange={handleCurrPassword('password')}
                type="password"
                label="Current Password"
                validationError={false}
              />

              {/* New Password */}
              <InputField
                required
                type="password"
                handleChange={handleNewPassword('password')}
                success={isSuccess.current}
                helperText={
                  validateStartEmptySpacing(newPassword.password)
                    ? 'Should not start with empty space'
                    : ''
                }
                label="New Password"
                validationError={validateStartEmptySpacing(
                  newPassword.password
                )}
                value={newPassword.password}
              />

              {/* Confirm new password */}
              <InputField
                helperText={
                  validateConfirmPassword(
                    newPassword.password,
                    confNewPassword.password
                  )
                    ? 'Password is not same'
                    : ''
                }
                required
                type="password"
                handleChange={handleConfPassword('password')}
                success={isSuccess.current}
                label="Confirm Password"
                validationError={validateConfirmPassword(
                  newPassword.password,
                  confNewPassword.password
                )}
                value={confNewPassword.password}
              />
              <Button
                data-cy="button"
                variant="contained"
                className={classes.button}
                onClick={() => {
                  if (
                    newPassword.password.length > 0 &&
                    confNewPassword.password.length > 0
                  ) {
                    setOpen(true);
                  }
                }}
              >
                Change password
              </Button>
              <Unimodal
                isOpen={open}
                handleClose={handleClose}
                hasCloseBtn={false}
              >
                <div className={classes.body}>
                  <img src="./icons/lock.svg" alt="lock" />
                  <div className={classes.text}>
                    <Typography className={classes.typo} align="center">
                      Your password <strong>has been changed!</strong>
                    </Typography>
                  </div>
                  <div className={classes.text1}>
                    <Typography className={classes.typo1}>
                      You can now use your new password to login to your account
                    </Typography>
                  </div>
                  <Button
                    data-cy="closeButton"
                    variant="contained"
                    className={classes.button}
                    onClick={handleClose}
                  >
                    Done
                  </Button>
                </div>
              </Unimodal>
            </form>

            <div className={classes.col2}>
              <img src="./icons/pass.svg" data-cy="lock" alt="lockIcon" />
              <Typography className={classes.txt1}>
                Your new password <strong>must</strong> be:
              </Typography>
              <Typography className={classes.txt2}>
                1. Be at least 8 characters in length
              </Typography>
              <Typography className={classes.txt2}>
                2. Not be same as your current password
              </Typography>
              <Typography className={classes.txt2}>
                3. Be a combination of letters, numbers and special characters
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountSettings;
