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

interface State {
  password: string;
  err: boolean;
  showPassword: boolean;
}

const AccountSettings: React.FC = () => {
  const classes = useStyles();

  const regularExpression = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&_*])[a-zA-Z0-9!@#$%^&_*]{8,16}$/;

  const [values2, setValues2] = React.useState<State>({
    password: '',
    showPassword: false,
    err: true,
  });
  const [values1, setValues1] = React.useState<State>({
    password: '123456789',
    showPassword: false,
    err: false,
  });
  const [values3, setValues3] = React.useState<State>({
    password: '',
    showPassword: false,
    err: true,
  });

  const [formError2, setFormError2] = React.useState<boolean>(false);
  const [formError3, setFormError3] = React.useState<boolean>(false);

  const handleChange2 = (prop: keyof State) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      event.target.value.length >= 8 &&
      event.target.value !== values1.password &&
      regularExpression.test(event.target.value) &&
      (values3.password.length === 0 || event.target.value === values3.password)
    ) {
      setValues2({ ...values2, err: false, [prop]: event.target.value });
      setValues3({ ...values3, err: false });
      setFormError2(false);
      setFormError3(false);
    } else {
      setValues2({ ...values2, err: true, [prop]: event.target.value });
      setValues3({ ...values3, err: true });
      setFormError2(true);
    }
  };

  const handleChange3 = (prop: keyof State) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value === values2.password) {
      setValues3({ ...values3, err: false, [prop]: event.target.value });
      setValues2({ ...values2, err: false });
      setFormError3(false);
      setFormError2(false);
    } else {
      setValues3({ ...values3, err: true, [prop]: event.target.value });
      setValues2({ ...values2, err: true });
      setFormError3(true);
    }
  };

  const handleClickShowPassword1 = () => {
    setValues1({ ...values1, showPassword: !values1.showPassword });
  };
  const handleClickShowPassword2 = () => {
    setValues2({ ...values2, showPassword: !values2.showPassword });
  };
  const handleClickShowPassword3 = () => {
    setValues3({ ...values3, showPassword: !values3.showPassword });
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
          <PersonalDetails />
          <Divider className={classes.divider} />
          <Typography className={classes.headerText}>
            <strong>Password</strong>
          </Typography>
          <div className={classes.outerPass}>
            <form className={classes.innerPass}>
              <FormControl>
                <Input
                  className={classes.pass}
                  defaultValue={values1.password}
                  id="outlined-adornment-password"
                  type={values1.showPassword ? 'text' : 'password'}
                  disableUnderline
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword1}
                        edge="end"
                      >
                        {values1.showPassword ? (
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
              <FormControl>
                <Input
                  data-cy="changePassword"
                  className={`${classes.pass} ${
                    formError2 ? classes.error : classes.success
                  }`}
                  id="outlined-adornment-password"
                  type={values2.showPassword ? 'text' : 'password'}
                  onChange={handleChange2('password')}
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
                        {values2.showPassword ? (
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
              <FormControl>
                <Input
                  data-cy="confirmPassword"
                  className={`${classes.pass} ${
                    formError3 ? classes.error : classes.success
                  }`}
                  id="outlined-adornment-password"
                  type={values3.showPassword ? 'text' : 'password'}
                  onChange={handleChange3('password')}
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
                        {values3.showPassword ? (
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
              <PasswordModal er2={values2.err} er3={values3.err} />
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
