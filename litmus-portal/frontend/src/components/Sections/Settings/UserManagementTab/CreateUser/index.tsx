import { Divider, IconButton, Typography } from '@material-ui/core';
import React from 'react';
import NewUserModal from './NewUserModal';
import InputField from '../../../../../containers/layouts/InputField';
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
    event: React.ChangeEvent<{ value: string }>
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

  // for personal details fields
  const [personalData, setPersonalData] = React.useState<personalData>({
    email: '',
    userName: '',
    fullName: '',
  });

  const handleUsername = (event: React.ChangeEvent<{ value: string }>) => {
    setPersonalData({
      ...personalData,
      userName: event.target.value,
    });
  };

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
                      <InputField
                        label="Username"
                        value={personalData.userName}
                        handleChange={handleUsername}
                        validationError={false}
                        disabled
                      />
                      <InputField
                        required
                        type="password"
                        handleChange={handleCreatePassword('password')}
                        value={createPAssword.password}
                        validationError={createPAssword.err}
                        label="New Password"
                      />
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
