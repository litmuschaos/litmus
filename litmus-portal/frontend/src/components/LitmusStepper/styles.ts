import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'hidden',
  },
  stepper: {
    background: 'none',
    margin: theme.spacing(0, -3, 0, -5),
    padding: theme.spacing(5, 0, 0, 0),
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(0, -8, 0, -10),
    },
  },
  label: {
    color: theme.palette.horizontalStepper.pending,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(-9),
  },
  activeLabel: {
    color: theme.palette.horizontalStepper.active,
  },
  completedLabel: {
    color: theme.palette.horizontalStepper.completed,
  },

  // Stepper Content
  stepperContent: {
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
    marginTop: theme.spacing(-1.5),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(5),
  },

  // Stepper Actions
  stepperActions: {
    display: 'flex',
    marginTop: theme.spacing(3.75),
  },
  endAction: {
    flexGrow: 1,
    '& button': {
      cssFloat: 'right',
    },
  },
  nextArrow: {
    paddingLeft: theme.spacing(1),
  },
}));

const useStepIconStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    background: theme.palette.text.hint,
    borderRadius: '50%',
    color: theme.palette.text.primary,
    display: 'flex',
    fontSize: '1rem',
    height: '1.5rem',
    justifyContent: 'center',
    width: '1.5rem',
    zIndex: 20,
  },
  active: {
    backgroundColor: theme.palette.horizontalStepper.active,
  },
  completed: {
    background: theme.palette.text.primary,
    color: theme.palette.text.secondary,
  },
  innerCircle: {
    background: theme.palette.background.paper,
    borderRadius: '50%',
    height: '0.5rem',
    width: '0.5rem',
  },
}));

export { useStyles, useStepIconStyles };
