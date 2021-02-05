import StepConnector from '@material-ui/core/StepConnector';
import { Theme, withStyles } from '@material-ui/core/styles';

const QontoConnector = withStyles((theme: Theme) => ({
  alternativeLabel: {
    top: 10,
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
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
    borderColor: theme.palette.disabledBackground,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector);

export default QontoConnector;
