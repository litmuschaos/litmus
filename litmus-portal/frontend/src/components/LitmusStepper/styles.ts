import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'hidden',
  },
  stepper: {
    background: 'none',
    padding: theme.spacing(5, 0, 0, 0),
    margin: theme.spacing(0, -3, 0, -5),
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(0, -8, 0, -10),
    },
  },
  label: {
    marginTop: theme.spacing(-9),
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: theme.palette.horizontalStepper.pending,
  },
  activeLabel: {
    color: theme.palette.horizontalStepper.active,
  },
  completedLabel: {
    color: theme.palette.horizontalStepper.completed,
  },

  // Stepper Content
  stepperContent: {
    marginTop: theme.spacing(-1.5),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
  },

  // Stepper Actions
  stepperActions: {
    display: 'flex',
    marginTop: theme.spacing(3.75),
  },
  endAction: {
    flexGrow: 1,
    '& button': {
      float: 'right',
    },
  },
  nextArrow: {
    paddingLeft: theme.spacing(1),
  },
}));

const useStepIconStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    fontSize: '1rem',
    zIndex: 20,
    color: theme.palette.text.primary,
    background: theme.palette.text.hint,
  },
  active: {
    backgroundColor: theme.palette.horizontalStepper.active,
  },
  completed: {
    background: theme.palette.text.primary,
  },
  innerCircle: {
    borderRadius: '50%',
    width: '0.5rem',
    height: '0.5rem',
    background: theme.palette.background.paper,
  },
}));

export { useStyles, useStepIconStyles };
