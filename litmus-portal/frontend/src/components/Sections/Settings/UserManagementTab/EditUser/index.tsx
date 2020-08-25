import {
  Divider,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React from 'react';
import DelUser from './DelUser';
import ResetModal from './ResetModal';
import UserDetails from '../CreateUser/UserDetails';
import useStyles from './styles';

interface Password {
  password: string;
  err: boolean;
  showPassword: boolean;
}

// Props for CreateUser component
interface EditUserProps {
  handleDiv: () => void;
  email: string;
  userName: string;
  fullName: string;
}

// CreateUser displays the UI screen for creating a new user by admin
const EditUser: React.FC<EditUserProps> = ({
  handleDiv,
  email,
  userName,
  fullName,
}) => {
  const classes = useStyles();

  // for password validation
  const regularExpression = new RegExp(
    '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );

  // for conditional rendering of reset password div

  const [createPAssword, setCreatePassword] = React.useState<Password>({
    password: '',
    showPassword: false,
    err: false,
  });

  // handles password field
  const handleCreatePassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (regularExpression.test(event.target.value)) {
      setCreatePassword({
        ...createPAssword,
        err: false,
        [prop]: event.target.value,
      });
    } else {
      setCreatePassword({
        ...createPAssword,
        err: true,
        [prop]: event.target.value,
      });
    }
  };

  const handleClickShowPassword = () => {
    setCreatePassword({
      ...createPAssword,
      showPassword: !createPAssword.showPassword,
    });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <div>
      <div className={classes.headDiv}>
        <div className={classes.createDiv}>
          <IconButton onClick={handleDiv} className={classes.backButton}>
            <img src="./icons/BackArrow.svg" alt="back" />
          </IconButton>
          <Typography className={classes.divHeaderText}>
            <strong>Edit user profile</strong>
          </Typography>
        </div>

        <Typography className={classes.descText}>
          Edit the user&apos;s personal and login details
        </Typography>
        <div className={classes.container}>
          <div>
            <div className={classes.suSegments}>
              {/* Personal Details */}
              <UserDetails
                nameIsDisabled
                emailIsDisabled
                nameValue={fullName}
                usernameIsDisabled
                emailValue={email}
                userValue={userName}
              />

              <Divider className={classes.divider} />

              {/* Login Details */}

              <div>
                <Typography className={classes.headerText}>
                  <strong> Login Details</strong>
                </Typography>
                <div>
                  <form>
                    <div className={classes.details1}>
                      <FormControl>
                        <Input
                          required
                          data-cy="changePassword"
                          className={`${classes.pass} ${
                            createPAssword.err ? classes.error : classes.success
                          }`}
                          id="outlined-adornment-password"
                          type={
                            createPAssword.showPassword ? 'text' : 'password'
                          }
                          onChange={handleCreatePassword('password')}
                          disableUnderline
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                data-cy="conVisibilty"
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {createPAssword.showPassword ? (
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
                    </div>
                    <Divider className={classes.divider} />
                    <DelUser handleModal={handleDiv} tableDelete={false} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.buttonGroup}>
          <ResetModal
            resetPossible={createPAssword.password.length > 0}
            password={createPAssword.password}
            username={userName}
            handleModal={handleDiv}
          />
        </div>
      </div>
    </div>
  );
};
export default EditUser;
