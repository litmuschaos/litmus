import React from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import useStyles from './styles';
import CStepper from './step';

export default function WelcomeModal() {
  const classes = useStyles();
  // getModalStyle is not a pure function,
  // we roll the style only on the first render

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

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
      <Button
        variant="contained"
        onClick={handleOpen}
        color="secondary"
        data-cy="WelcomeModal-Button"
      >
        To start
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}
