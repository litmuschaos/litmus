import React from 'react';
import Modal from '@material-ui/core/Modal';
import useStyles from './styles';
import CStepper from './step';

interface ModalProps {
  isOpen: boolean;
}

const WelcomeModal: React.FC<ModalProps> = ({ isOpen }) => {
  const classes = useStyles();
  // getModalStyle is not a pure function,
  // we roll the style only on the first render

  const [open, setOpen] = React.useState(isOpen);

  const handleClose = () => {
    setOpen(false);
  };
  const body = (
    <div className={classes.rootContainer}>
      <CStepper />
    </div>
  );

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        disableBackdropClick
        disableEscapeKeyDown
      >
        {body}
      </Modal>
    </div>
  );
};

export default WelcomeModal;
