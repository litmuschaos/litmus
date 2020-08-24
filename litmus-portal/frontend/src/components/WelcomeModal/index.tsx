import React from 'react';
import ModalStepper from './Stepper';
import useStyles from './styles';
import Unimodal from '../../containers/layouts/Unimodal';

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
      <Unimodal isOpen handleClose={handleClose} hasCloseBtn={false}>
        {body}
      </Unimodal>
    </div>
  );
};

export default Welcomemodal;
