import Modal from '@material-ui/core/Modal';
import React from 'react';
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

  const body = (
    <div className={classes.rootContainer}>
      <ModalStepper handleModal={handleClose} />
    </div>
  );

  return (
    <div>
      <Modal
        open
        onClose={handleClose}
        disableBackdropClick
        disableEscapeKeyDown
      >
        {body}
      </Modal>
    </div>
  );
};

export default Welcomemodal;
