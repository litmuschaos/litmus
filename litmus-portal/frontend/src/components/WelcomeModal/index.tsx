import React from 'react';
import Modal from '@material-ui/core/Modal';
import useStyles from './styles';
import ModalStepper from './Stepper';

interface WelcomemodalProps {
  isOpen: boolean;
}

const Welcomemodal: React.FC<WelcomemodalProps> = ({ isOpen }) => {
  const classes = useStyles();
  // getModalStyle is not a pure function,
  // we roll the style only on the first render

  const [open, setOpen] = React.useState(isOpen);

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div className={classes.rootContainer}>
      <ModalStepper />
    </div>
  );

  return (
    <div>
      <Modal
        open={open}
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
