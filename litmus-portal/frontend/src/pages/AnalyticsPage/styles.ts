import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  popOverRootContainer: {
    height: '20%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  popOverRoot: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(6),
    marginBottom: theme.spacing(8),
  },

  root: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(6),
    marginBottom: theme.spacing(8),
  },
  headerDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3),
  },

  analyticsDiv: {
    marginTop: theme.spacing(5),
  },
}));

export default useStyles;
