import { Button, Modal } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import avatar from '../../../assets/icons/avatar.png';
import User from '../../../assets/icons/userLarge.svg';
import useStyles from './styles';

const PersonalDetails: React.FC = () => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const [values2, setValues2] = React.useState<string>('');
  const [values1, setValues1] = React.useState<string>('');
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
          <div className={classes.details1}>
            <TextField
              required
              value={values1}
              onChange={(e) => {
                setValues1(e.target.value);
              }}
              className={classes.user}
              id="filled-user-input"
              label="Full Name"
              InputProps={{ disableUnderline: true }}
              data-cy="fullName"
            />

            <TextField
              required
              value={values2}
              onChange={(e) => {
                setValues2(e.target.value);
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
              if (values1.length > 0 && values2.length > 0) {
                setOpen(true);
              }
            }}
          >
            Save Changes
          </Button>
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
