import {
  Button,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import React from 'react';
import copy from '../../../assets/icons/copy.svg';
import DelUser from '../Modals/DelUser';
import NewUserModal from '../Modals/NewUserModal';
import ResetModal from '../Modals/ResetModal';
import useStyles from './styles';
import UserDetails from './UserDetails';

interface Password {
  password: string;
  err: boolean;
  showPassword: boolean;
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
  const [showDiv, setShowDiv] = React.useState<boolean>(false);

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
  const [email, setEmail] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [fullName, setFullName] = React.useState<string>('');

  return (
    <div>
      <div className={classes.container}>
        <div>
          <div className={classes.suSegments}>
            {/* Personal Details */}
            <UserDetails
              nameValue={fullName}
              usernameIsDisabled={false}
              handleNameChange={(e) => {
                setFullName(e.target.value);
              }}
              emailValue={email}
              handleEmailChange={(e) => {
                setEmail(e.target.value);
              }}
              userValue={userName}
              handleUserChange={(e) => {
                setUserName(e.target.value);
              }}
            />

            <Divider className={classes.divider} />

            {/* Login Details */}
            {showDiv ? (
              /* Displays the reset password div */
              <div>
                <Typography className={classes.headerText}>
                  <strong> Reset Password</strong>
                </Typography>
                <ResetModal
                  resetPossible={fullName.length > 0 && userName.length > 0}
                />
                <div className={classes.copyDiv}>
                  <img src={copy} alt="copy" />
                  <Typography>Copy the credentials </Typography>
                </div>
                <DelUser handleModal={handleDiv} />
              </div>
            ) : (
              /* displays create password div */
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
                        value={userName}
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
                    <Typography className={classes.txt1}>
                      New random password will be created for the user or create
                      by own
                    </Typography>

                    <Button
                      variant="contained"
                      className={classes.createRandomButton}
                      disableElevation
                      onClick={() => {
                        if (
                          !createPAssword.err &&
                          createPAssword.password.length > 0 &&
                          userName.length > 0 &&
                          fullName.length > 0
                        )
                          setShowDiv(true);
                      }}
                    >
                      Create new password
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={classes.buttonGroup}>
        <Button
          data-cy="button"
          variant="outlined"
          className={classes.button}
          onClick={handleDiv}
        >
          Cancel
        </Button>
        <NewUserModal
          showModal={
            fullName.length > 0 &&
            !createPAssword.err &&
            userName.length > 0 &&
            createPAssword.password.length > 0
          }
        />
      </div>
    </div>
  );
};
export default CreateUser;
