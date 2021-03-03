import { StepConnector, Theme, withStyles } from '@material-ui/core';

const LitmusStepConnector = withStyles((theme: Theme) => ({
  alternativeLabel: {
    top: 10,
    marginLeft: theme.spacing(-1.375),
    marginRight: theme.spacing(-1.375),
  },
  active: {
    '& $line': {
      borderImage: `linear-gradient(to right, ${theme.palette.horizontalStepper.completed} , ${theme.palette.horizontalStepper.active})`,
      borderImageSlice: 1,
    },
  },
  completed: {
    '& $line': {
      borderColor: theme.palette.horizontalStepper.completed,
    },
  },
  line: {
    borderColor: theme.palette.horizontalStepper.pending,
    borderTopWidth: 3,
  },
}))(StepConnector);

export { LitmusStepConnector };
