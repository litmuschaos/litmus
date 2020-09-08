import { Button, Typography, Divider } from '@material-ui/core';
import React from 'react';
import PersonalDetails from '../PersonalDetails';
import useStyles from './styles';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import InputField from '../../../../../containers/layouts/InputField';

// used for password field
interface Password {
  password: string;
  err: boolean;
  showPassword: boolean;
}

// AccountSettings displays the starting page of "Accounts" tab
const AccountSettings: React.FC = () => {
  const classes = useStyles();

  // used for modal
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // used for password validation
  const regularExpression = new RegExp(
    '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );

  // states for the three password fields
  const [currPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
    err: false,
  });
  const [newPassword, setNewPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
    err: false,
  });
  const [confNewPassword, setConfNewPassword] = React.useState<Password>({
    password: '',
    showPassword: false,
    err: false,
  });

  // handleNewPassword handles password validation for second password field
  const handleNewPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      event.target.value !== currPassword.password &&
      regularExpression.test(event.target.value) &&
      (confNewPassword.password.length === 0 ||
        event.target.value === confNewPassword.password)
    ) {
      setNewPassword({
        ...newPassword,
        err: false,
        [prop]: event.target.value,
      });
      setConfNewPassword({ ...confNewPassword, err: false });
    } else {
      setNewPassword({ ...newPassword, err: true, [prop]: event.target.value });
      setConfNewPassword({ ...confNewPassword });
    }
  };

  // handleConfPassword handles password validation for third password field
  const handleConfPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      event.target.value === newPassword.password &&
      regularExpression.test(event.target.value)
    ) {
      setConfNewPassword({
        ...confNewPassword,
        err: false,
        [prop]: event.target.value,
      });
      setNewPassword({ ...newPassword, err: false });
    } else {
      setConfNewPassword({
        ...confNewPassword,
        err: true,
        [prop]: event.target.value,
      });
      setNewPassword({ ...newPassword });
    }
  };

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
                defaultValue={currPassword.password}
                id="outlined-adornment-password"
                type="password"
                label="Current Password"
                validationError={currPassword.err}
              />

              {/* New Password */}
              <InputField
                dataCy="changePassword"
                id="outlined-adornment-password"
                type="password"
                handleChange={handleNewPassword('password')}
                label="New Password"
                validationError={newPassword.err}
              />

              {/* Confirm new password */}
              <InputField
                dataCy="confirmPassword"
                id="outlined-adornment-password"
                type="password"
                handleChange={handleConfPassword('password')}
                label="Confirm Password"
                validationError={confNewPassword.err}
              />
              <Button
                data-cy="button"
                variant="contained"
                className={classes.button}
                onClick={() => {
                  if (
                    !(newPassword.err && confNewPassword.err) &&
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
