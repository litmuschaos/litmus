import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(7),
  },
  // styles for text
  text: {
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(3.75),
    width: '23.5rem',
  },
  textError: {
    margin: '0 auto',
    marginTop: theme.spacing(13.75),
    width: '20.5rem',
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
    width: '27.5rem',
  },
  textSecondError: {
    height: '1.6875rem',
    margin: '0 auto',
    marginTop: theme.spacing(3.75),
    width: '27.5rem',
  },
  errDiv: {
    color: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7, 0),
    textAlign: 'center',
    width: '100%',
  },
  typoSub: {
    fontSize: '1rem',
  },

  // styles for buttons

  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
}));
export default useStyles;
