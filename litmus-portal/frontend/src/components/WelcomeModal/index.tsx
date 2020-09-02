import React from 'react';
import ModalStepper from './Stepper';
import useStyles from './styles';
import Unimodal from '../../containers/layouts/Unimodal';

const Welcomemodal: React.FC = () => {
  const classes = useStyles();
  // getModalStyle is not a pure function,
  // we roll the style only on the first render

  const body = (
    <div className={classes.rootContainer}>
      <ModalStepper />
    </div>
  );

  return (
    <div>
      <Unimodal isOpen handleClose={() => {}} hasCloseBtn={false}>
        {body}
      </Unimodal>
    </div>
  );
};

export default Welcomemodal;
