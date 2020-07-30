import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  workflowHeader: {
    margin: '2.5rem 0',
    marginLeft: '7%',
    fontSize: '2rem',
  },
  stepper: {
    marginTop: theme.spacing(5),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  content: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: '9%',
  },
  activeLabel: {
    color: theme.palette.primary.light,
    marginTop: theme.spacing(-9),
    fontWeight: 'bold',
    fontSize: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  normalLabel: {
    color: theme.palette.grey[600],
    fontSize: theme.spacing(1.5),
    marginTop: theme.spacing(-9),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  nextArrow: {
    marginLeft: theme.spacing(2.5),
  },
}));

export default useStyles;
