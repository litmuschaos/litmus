import { Button, Modal, Typography } from '@material-ui/core';
import React from 'react';
import UserDetails from '../../UserManagementTab/CreateUser/UserDetails';
import useStyles from './styles';

interface personaData {
  email: string;
  userName: string;
  fullName: string;
}

// Displays the personals details on the "accounts" tab
const PersonalDetails: React.FC = () => {
  const classes = useStyles();

  const [personaData, setPersonaData] = React.useState<personaData>({
    email: '',
    userName: '',
    fullName: '',
  });

  // For closing and opening of the modal
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <form>
        <UserDetails
          nameValue={personaData.fullName}
          usernameIsDisabled
          handleNameChange={(e) => {
            setPersonaData({
              fullName: e.target.value,
              userName: personaData.userName,
              email: personaData.email,
            });
          }}
          emailValue={personaData.email}
          handleEmailChange={(e) => {
            setPersonaData({
              fullName: personaData.fullName,
              userName: personaData.userName,
              email: e.target.value,
            });
          }}
          userValue={personaData.userName}
          handleUserChange={(e) => {
            setPersonaData({
              fullName: personaData.fullName,
              userName: e.target.value,
              email: personaData.email,
            });
          }}
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
          <Modal
            data-cy="modal"
            open={open}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            className={classes.modal}
          >
            <div className={classes.paper}>
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
            </div>
          </Modal>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
