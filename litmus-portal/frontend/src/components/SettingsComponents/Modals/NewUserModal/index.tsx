import { Modal, Typography } from '@material-ui/core';
import React from 'react';
import ButtonFilled from '../../../Button/ButtonFilled';
import useStyles from './styles';

// Props for NewUserModal component
interface NewUserModalProps {
  showModal: boolean;
}

// NewUserModal displays a modal on creating a new user
const NewUserModal: React.FC<NewUserModalProps> = ({ showModal }) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <ButtonFilled
        isPrimary
        isDisabled={false}
        handleClick={() => {
          if (showModal) setOpen(true);
        }}
      >
        <>Save</>
      </ButtonFilled>

      <Modal
        data-cy="modal"
        open={open}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
        <div className={classes.paper}>
          <div className={classes.body}>
            <img src="./icons/checkmark.svg" alt="checkmark" />
            <div className={classes.text}>
              <Typography className={classes.typo} align="center">
                A new user was <strong>successfully created </strong>
              </Typography>
            </div>
            <div className={classes.textSecond}>
              <Typography className={classes.typoSub}>
                A new user was successfully created.Now information about it
                will be displayed on the user management screen of the
                application. You can copy the credentials and share it with the
                respective user.
              </Typography>
            </div>
            <div className={classes.copyDiv}>
              <img src="./icons/copy.svg" alt="copy" />
              <Typography>Copy the credentials </Typography>
            </div>
            <div className={classes.buttonModal}>
              {' '}
              <ButtonFilled
                isPrimary
                isDisabled={false}
                handleClick={handleClose}
              >
                <>Done</>
              </ButtonFilled>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default NewUserModal;
