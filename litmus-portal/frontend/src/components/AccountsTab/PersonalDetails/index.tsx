import { Button, Modal } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import User from '../../../assets/icons/userLarge.svg';
import UserDetails from '../../UserManagementTab/CreateUser/UserDetails';
import useStyles from './styles';

// Displays the personals details on the "accounts" tab
const PersonalDetails: React.FC = () => {
  const classes = useStyles();

  // For closing and opening of the modal
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const [email, setEmail] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [fullName, setFullName] = React.useState<string>('');
  return (
    <div>
      <form>
        <UserDetails
          nameValue={fullName}
          usernameIsDisabled
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

        <div className={classes.saveButton}>
          <Button
            className={classes.submitButton}
            data-cy="loginButton"
            onClick={() => {
              // checks if Full name field is empty
              if (fullName.length > 0) {
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
                <img src={User} alt="user" />
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
