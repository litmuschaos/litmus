import { withStyles, Theme } from '@material-ui/core/styles';
import StepConnector from '@material-ui/core/StepConnector';

const QontoConnector = withStyles((theme: Theme) => ({
  alternativeLabel: {
    top: 10,
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
  },
  active: {
    '& $line': {
      borderImage: `linear-gradient(to right, ${theme.palette.grey[800]} , ${theme.palette.primary.light})`,
      borderImageSlice: 1,
    },
  },
  completed: {
    '& $line': {
      borderColor: theme.palette.grey[800],
    },
  },
  line: {
    borderColor: theme.palette.grey[200],
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector);

export default QontoConnector;
