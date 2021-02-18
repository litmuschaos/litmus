import React from 'react';
import { Modal } from 'litmus-ui';
import ModalStepper from './Stepper';
import useStyles from './styles';

interface WelcomemodalProps {
  handleIsOpen: () => void;
}

const Welcomemodal: React.FC<WelcomemodalProps> = ({ handleIsOpen }) => {
  const classes = useStyles();
  // getModalStyle is not a pure function,
  // we roll the style only on the first render

  const handleClose = () => {
    handleIsOpen();
  };

  return (
    <Modal
      open
      width="60%"
      className={classes.modal}
      onClose={handleClose}
      disableBackdropClick
    >
      <ModalStepper handleModal={handleClose} />
    </Modal>
  );
};

export default Welcomemodal;
