import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // styles for text
  text: {
    width: '23.5rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  textError: {
    width: '20.5rem',
    marginTop: theme.spacing(13.75),
    margin: '0 auto',
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    width: '27.5rem',
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  textSecondError: {
    width: '27.5rem',
    height: '1.6875rem',
    marginTop: theme.spacing(3.75),
    margin: '0 auto',
  },
  errDiv: {
    color: theme.palette.personalDetailsBodyColor,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  typoSub: {
    fontSize: '1rem',
  },

  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
}));
export default useStyles;
