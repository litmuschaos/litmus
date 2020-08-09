import { Typography } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import React from 'react';
import ButtonFilled from '../../../Button/ButtonFilled';
import ButtonOutline from '../../../Button/ButtonOutline';
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
        <img src="./icons/bin.svg" alt="delete" className={classes.bin} />
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
            <img src="./icons/userDel.svg" alt="lock" />
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
              <ButtonOutline isDisabled={false} handleClick={handleClose}>
                <> No</>
              </ButtonOutline>
              <ButtonFilled
                isDisabled={false}
                isPrimary
                handleClick={handleModal}
              >
                <>Yes</>
              </ButtonFilled>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DelUser;
