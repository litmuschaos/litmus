import Button from '@material-ui/core/Button';
import React from 'react';
import useStyles from './styles';
import Unimodal from '../Unimodal';

/* Icon function is used for finish modal to show mark */
function Icon() {
  const classes = useStyles();

  return <img src="icons/finish.png" className={classes.mark} alt="mark" />;
}

const FinishModal = () => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  /* Body part for modal */
  const body = (
    <div className={classes.rootContainer}>
      <Icon />
      <div className={classes.heading}>
        A new chaos workflow,
        <br />
        <strong>was successfully created!</strong>
      </div>
      <div className={classes.headWorkflow}>
        Congratulations on creating your first workflow! Now information about{' '}
        <br /> it will be displayed on the main screen of the application.
      </div>
      <div className={classes.button}>
        <Button
          variant="contained"
          color="secondary"
          data-cy="selectFinish"
          onClick={handleClose}
        >
          Back to workflow
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        data-cy="selectModal"
        onClick={handleOpen}
      >
        Completed
      </Button>

      {/* Finish Modal is added */}

      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
        {body}
      </Unimodal>
    </div>
  );
};

export default FinishModal;
