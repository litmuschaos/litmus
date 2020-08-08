import { Button, Modal } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import avatar from '../../../assets/icons/avatar.png';
import User from '../../../assets/icons/userLarge.svg';
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
  const [fullName, setFullName] = React.useState<string>('');
  return (
    <div>
      <Typography className={classes.headerText}>
        <strong> Personal Details</strong>
      </Typography>
      <form>
        <div className={classes.details}>
          <div className={classes.dp}>
            <Avatar
              data-cy="avatar"
              alt="Richard Hill"
              src={avatar}
              className={classes.orange}
            >
              R
            </Avatar>
            <div>
              <label htmlFor="contained-button-file" id="editPic">
                <input
                  name="contained-button-file"
                  accept="image/*"
                  className={classes.input}
                  id="contained-button-file"
                  type="file"
                />
                <Typography className={classes.edit}>Edit Photo</Typography>
              </label>
            </div>
          </div>
          {/* Fields for details including Full name, email, username */}
          <div className={classes.details1}>
            <TextField
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              className={classes.user}
              id="filled-user-input"
              label="Full Name"
              InputProps={{ disableUnderline: true }}
              data-cy="fullName"
            />

            <TextField
              required
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className={classes.user}
              id="filled-email-input"
              label="Email Address"
              name="email"
              InputProps={{
                disableUnderline: true,
              }}
              data-cy="inputEmail"
            />
            {/* Username is not editable normal user */}
            <TextField
              className={classes.user}
              id="filled-username-input"
              label="Username"
              defaultValue="RichardHill"
              disabled
              InputProps={{
                disableUnderline: true,
              }}
              data-cy="username"
            />
          </div>
        </div>
        <div className={classes.saveButton}>
          <Button
            className={classes.submitButton}
            data-cy="loginButton"
            onClick={() => {
              if (fullName.length > 0 && email.length > 0) {
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
