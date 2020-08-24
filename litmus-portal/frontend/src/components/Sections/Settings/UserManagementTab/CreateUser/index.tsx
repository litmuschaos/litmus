import {
  Divider,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React from 'react';
import NewUserModal from './NewUserModal';
import useStyles from './styles';
import UserDetails from './UserDetails';

interface Password {
  password: string;
  err: boolean;
  showPassword: boolean;
}

interface personalData {
  email: string;
  userName: string;
  fullName: string;
}

// Props for CreateUser component
interface CreateUserProps {
  handleDiv: () => void;
}

// CreateUser displays the UI screen for creating a new user by admin
const CreateUser: React.FC<CreateUserProps> = ({ handleDiv }) => {
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

  // for personal details fields
  const [personalData, setPersonalData] = React.useState<personalData>({
    email: '',
    userName: '',
    fullName: '',
  });

  return (
    <div>
      <div className={classes.headDiv}>
        <div className={classes.createDiv}>
          <IconButton onClick={handleDiv} className={classes.backButton}>
            <img src="./icons/BackArrow.svg" alt="back" />
          </IconButton>
          <Typography className={classes.divHeaderText}>
            <strong>Create a new user</strong>
          </Typography>
        </div>

        <Typography className={classes.descText}>
          Enter the user&apos;s personal and login details
        </Typography>

        <div className={classes.container}>
          <div>
            <div className={classes.suSegments}>
              {/* Personal Details */}
              <UserDetails
                nameValue={personalData.fullName}
                usernameIsDisabled={false}
                emailIsDisabled={false}
                nameIsDisabled={false}
                handleNameChange={(e) => {
                  setPersonalData({
                    fullName: e.target.value,
                    userName: personalData.userName,
                    email: personalData.email,
                  });
                }}
                emailValue={personalData.email}
                handleEmailChange={(e) => {
                  setPersonalData({
                    fullName: personalData.fullName,
                    userName: personalData.userName,
                    email: e.target.value,
                  });
                }}
                userValue={personalData.userName}
                handleUserChange={(e) => {
                  setPersonalData({
                    fullName: personalData.fullName,
                    userName: e.target.value,
                    email: personalData.email,
                  });
                }}
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
                      <TextField
                        className={classes.userDetail}
                        id="filled-username-input"
                        label="Username"
                        defaultValue="RichardHill"
                        value={personalData.userName}
                        disabled
                        InputProps={{
                          disableUnderline: true,
                        }}
                        data-cy="username"
                      />
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
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.buttonGroup}>
          <NewUserModal
            showModal={
              !createPAssword.err &&
              personalData.userName.length > 0 &&
              createPAssword.password.length > 0
            }
            name={personalData.fullName}
            email={personalData.email}
            username={personalData.userName}
            password={createPAssword.password}
          />
        </div>
      </div>
    </div>
  );
};
export default CreateUser;
