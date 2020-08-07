import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import React from 'react';
import bin from '../../../../assets/icons/bin.svg';
import userDel from '../../../../assets/icons/userDel.svg';
import useStyles from './styles';

// props for DelUser component
interface DelUserProps {
  handleModal: () => void;
}

// DelUser displays the modal for deteing a user
const DelUser: React.FC<DelUserProps> = ({ handleModal }) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={() => {
          setOpen(true);
        }}
        className={classes.delDiv}
        onClick={() => {
          setOpen(true);
        }}
      >
        <img src={bin} alt="delete" className={classes.bin} />
        <Typography>Delete the user </Typography>
      </div>

      <Modal
        data-cy="modal"
        open={open}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
        <div className={classes.paper}>
          <div className={classes.body}>
            <img src={userDel} alt="lock" />
            <div className={classes.text}>
              <Typography className={classes.typo} align="center">
                Are you sure
                <strong> to remove the current user?</strong>
              </Typography>
            </div>
            <div className={classes.textSecond}>
              <Typography className={classes.typoSub} align="center">
                The user will lose access to the portal
              </Typography>
            </div>
            <div className={classes.buttonGroup}>
              <Button
                data-cy="closeButton"
                variant="outlined"
                className={classes.buttonOutline}
                onClick={handleClose}
              >
                No
              </Button>
              <Button
                data-cy="closeButton"
                variant="contained"
                className={classes.buttonFilled}
                onClick={handleModal}
                disableElevation
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DelUser;
