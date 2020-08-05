import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '63.75rem',
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
    border: '0.0625rem',
    borderColor: theme.palette.primary.dark,
    borderRadius: '0.1875rem',
    paddingBottom: theme.spacing(5),
  },
  suSegments: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-even',
    marginLeft: theme.spacing(5),
  },

  // Upper segment
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
  },

  divider: {
    marginTop: theme.spacing(3.75),
    maxWidth: '58.75rem',
  },

  // Lower segment
  outerPass: {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '63.75rem',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  innerPass: {
    display: 'flex',
    flexDirection: 'column',
  },
  pass: {
    width: '24.43rem',
    height: '4.8125rem',
    marginBottom: theme.spacing(2.5),
    padding: theme.spacing(1),
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
  },
  col2: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    height: '16.375rem',
    maxWidth: '20.625rem',
    alignItems: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      order: -1,
      marginBottom: theme.spacing(5),
      marginLeft: theme.spacing(0),
    },
  },
  txt1: {
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
  },
  txt2: {
    marginBottom: theme.spacing(2.5),
    fontSize: '1rem',
  },
  success: {
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },
  error: {
    border: '0.0625rem solid',
    borderColor: theme.palette.error.main,
  },
}));
export default useStyles;
