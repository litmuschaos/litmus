import React from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import useStyles from './styles';

/* DelUser, NewUserModal, ResetModal need to be shifted */

interface UnimodalProps {
  children?: any;
  isOpen: boolean;
  handleClose: any;
  hasCloseBtn: boolean;
  isDark?: boolean;
}

const Unimodal: React.FC<UnimodalProps> = ({
  children,
  isOpen,
  handleClose,
  hasCloseBtn,
  isDark,
}) => {
  const classes = useStyles();

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
      data-cy="modal"
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div
        className={isDark ? classes.darkModalContainer : classes.modalContainer}
      >
        {hasCloseBtn && (
          <div className={classes.modalContainerClose}>
            <Button
              variant="outlined"
              color="secondary"
              className={isDark ? classes.darkCloseButton : classes.closeButton}
              onClick={handleClose}
            >
              &#x2715;
            </Button>
          </div>
        )}
        {children}
      </div>
    </Modal>
  );
};

export default Unimodal;
