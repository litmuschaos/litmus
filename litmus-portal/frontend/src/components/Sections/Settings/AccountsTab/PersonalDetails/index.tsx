import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { UserData } from '../../../../../models/user';
import { RootState } from '../../../../../redux/reducers';
import UserDetails from '../../UserManagementTab/CreateUser/UserDetails';
import useStyles from './styles';
import Unimodal from '../../../../../containers/layouts/Unimodal';

interface personaData {
  email: string;
  userName: string;
  fullName: string;
}

// Displays the personals details on the "accounts" tab
const PersonalDetails: React.FC = () => {
  const classes = useStyles();

  const userData: UserData = useSelector((state: RootState) => state.userData);

  const { name, email, username } = userData;

  const [personaData, setPersonaData] = React.useState<personaData>({
    email,
    userName: username,
    fullName: name,
  });

  // For closing and opening of the modal
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleUserChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: e.target.value,
      email: personaData.email,
    });
  };

  const handleNameChange = (e: any) => {
    setPersonaData({
      fullName: e.target.value,
      userName: personaData.userName,
      email: personaData.email,
    });
  };

  const handleEmailChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: personaData.userName,
      email: e.target.value,
    });
  };

  return (
    <div>
      <form>
        <UserDetails
          emailIsDisabled={false}
          nameIsDisabled={false}
          nameValue={personaData.fullName}
          usernameIsDisabled
          handleNameChange={handleNameChange}
          emailValue={personaData.email}
          handleEmailChange={handleEmailChange}
          userValue={personaData.userName}
          handleUserChange={handleUserChange}
        />

        <div className={classes.saveButton}>
          <Button
            className={classes.submitButton}
            data-cy="loginButton"
            onClick={() => {
              // checks if Full name field is empty
              if (personaData.fullName.length > 0) {
                setOpen(true);
              }
            }}
          >
            Save Changes
          </Button>

          {/* Displays the modal after details are successfully edited */}
          <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
            <div className={classes.body}>
              <img src="./icons/userLarge.svg" alt="user" />
              <div className={classes.text}>
                <Typography className={classes.typo} align="center">
                  Your personal information <strong>has been changed!</strong>
                </Typography>
              </div>
              <div className={classes.text1}>
                <Typography align="center" className={classes.typo1}>
                  Changes took effect
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
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
