import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.cards.background,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: '0.1875rem',
    marginTop: theme.spacing(3.75),
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  // Upper segment
  headerText: {
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(7.5),
  },

  divider: {
    marginTop: theme.spacing(3.75),
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
  col2: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    height: '16.375rem',
    marginLeft: theme.spacing(5),
    maxWidth: '20.625rem',
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(5),
      marginLeft: theme.spacing(0),
      order: -1,
    },
  },
  txt1: {
    fontSize: '1rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(3.75),
  },
  txt2: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2.5),
  },

  // Password Modal content styles
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: theme.spacing(15),
    paddingBottom: '7rem',
  },
  text: {
    height: '5.875rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(3.75),
    width: '23.5rem',
  },
  typo: {
    fontSize: '2.25rem',
  },
  text1: {
    height: '1.6875rem',
    width: '27.5rem',
  },
  typo1: {
    fontSize: '1rem',
  },

  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
  textSecondError: {
    height: '1.6875rem',
    margin: '0 auto',
    marginTop: theme.spacing(3.75),
    width: '27.5rem',
  },
  errDiv: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7, 0),
    textAlign: 'center',
    width: '100%',
  },
  typoSub: {
    fontSize: '1rem',
  },
  textError: {
    margin: '0 auto',
    marginTop: theme.spacing(13.75),
    width: '20.5rem',
  },
}));
export default useStyles;
