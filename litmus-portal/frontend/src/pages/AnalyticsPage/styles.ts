import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    overflowX: 'hidden',
  },

  popOverRootContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '20%',
    justifyContent: 'space-between',
  },

  popOverRoot: {
    marginBottom: theme.spacing(8),
    marginLeft: theme.spacing(6),
    marginTop: theme.spacing(5),
  },

  root: {
    marginBottom: theme.spacing(8),
    marginLeft: theme.spacing(6),
    marginTop: theme.spacing(5),
  },

  headerDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3),
  },

  analyticsDiv: {
    marginTop: theme.spacing(5),
  },

  waitingText: {
    fontSize: '2rem',
    marginBottom: '10%',
    marginLeft: '30%',
    marginTop: '20%',
  },

  waitingScreen: {
    alignContent: 'center',
  },

  button: {
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(-2),
  },
}));

export default useStyles;
