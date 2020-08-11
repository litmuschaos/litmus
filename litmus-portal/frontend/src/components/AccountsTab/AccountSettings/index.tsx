import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React from 'react';
import pass from '../../../assets/icons/pass.svg';
import PasswordModal from '../PasswordModal';
import PersonalDetails from '../PersonalDetails';
import useStyles from './styles';

// used for password field
interface Password {
  password: string;
  err: boolean;
  showPassword: boolean;
}

// AccountSettins displays the starting page of "Accounts" tab
const AccountSettings: React.FC = () => {
  const classes = useStyles();

  // used for password validation
  const regularExpression = new RegExp(
    '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );

  // states for the three password fields
  const [currPassword, setCurrPassword] = React.useState<Password>({
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

  // handleChange2 handles password validation for second password field
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

  // handleChange3 handles password validation for third password field
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

  // implements the logic for visibility of password
  const handleClickShowPassword1 = () => {
    setCurrPassword({
      ...currPassword,
      showPassword: !currPassword.showPassword,
    });
  };
  const handleClickShowPassword2 = () => {
    setNewPassword({ ...newPassword, showPassword: !newPassword.showPassword });
  };
  const handleClickShowPassword3 = () => {
    setConfNewPassword({
      ...confNewPassword,
      showPassword: !confNewPassword.showPassword,
    });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
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
              <FormControl>
                <Input
                  className={classes.pass}
                  defaultValue={currPassword.password}
                  id="outlined-adornment-password"
                  type={currPassword.showPassword ? 'text' : 'password'}
                  disableUnderline
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword1}
                        edge="end"
                      >
                        {currPassword.showPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <InputLabel htmlFor="outlined-adornment-password">
                  Current Password
                </InputLabel>
              </FormControl>
              {/* New Password */}
              <FormControl>
                <Input
                  data-cy="changePassword"
                  className={`${classes.pass} ${
                    newPassword.err ? classes.error : classes.success
                  }`}
                  id="outlined-adornment-password"
                  type={newPassword.showPassword ? 'text' : 'password'}
                  onChange={handleNewPassword('password')}
                  disableUnderline
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        data-cy="conVisibilty"
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword2}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {newPassword.showPassword ? (
                          <Visibility data-cy="visIcon" />
                        ) : (
                          <VisibilityOff data-cy="invisIcon" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <InputLabel htmlFor="outlined-adornment-password">
                  New Password
                </InputLabel>
              </FormControl>
              {/* Confirm new password */}
              <FormControl>
                <Input
                  data-cy="confirmPassword"
                  className={`${classes.pass} ${
                    confNewPassword.err ? classes.error : classes.success
                  }`}
                  id="outlined-adornment-password"
                  type={confNewPassword.showPassword ? 'text' : 'password'}
                  onChange={handleConfPassword('password')}
                  disableUnderline
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        data-cy="conVisibilty"
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword3}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {confNewPassword.showPassword ? (
                          <Visibility data-cy="visIcon" />
                        ) : (
                          <VisibilityOff data-cy="invisIcon" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <InputLabel htmlFor="outlined-adornment-password">
                  Confirm new password
                </InputLabel>
              </FormControl>
              <PasswordModal
                formErr={newPassword.err && confNewPassword.err}
                isEmpty={
                  !(
                    newPassword.password.length > 0 &&
                    confNewPassword.password.length > 0
                  )
                }
              />
            </form>

            <div className={classes.col2}>
              <img src={pass} data-cy="lock" alt="lockIcon" />
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
