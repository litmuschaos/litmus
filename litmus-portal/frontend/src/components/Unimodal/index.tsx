import React from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import useStyles from './styles';

/* WelcomeModal, PasswordModal, FinishModal, PersonalDetails, ChooseWorkflow, ReliabiltyScore, VerifyCommit */

interface UnimodalProps {
  children?: any;
  isOpen: boolean;
  handleClose: any;
  hasCloseBtn: boolean;
}

const Unimodal: React.FC<UnimodalProps> = ({
  children,
  isOpen,
  handleClose,
  hasCloseBtn,
}) => {
  const classes = useStyles();

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <div className={classes.modalContainer}>
        {hasCloseBtn && (
          <div className={classes.modalContainerClose}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.closeButton}
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
