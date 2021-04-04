import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Personal details
  headerText: {
    fontSize: '1.5625rem',
    marginTop: theme.spacing(7.5),
  },
  input: {
    alignItems: 'center',
    display: 'none',
  },
  // button styles for saving the changes of personal details
  saveButton: {
    marginLeft: theme.spacing(12.4),
    marginTop: theme.spacing(2),
    width: '7.0625rem',
  },
  // for closing the modal button
  button: {
    backgroundColor: theme.palette.secondary.dark,
    borderRadius: 0,
    color: theme.palette.common.white,
    height: '2.93rem',
    marginTop: theme.spacing(1.25),
    textTransform: 'none',
    width: '8.5rem',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  // styles for modal and its components
  body: {
    alignItems: 'center',
    color: 'none',
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
    width: '31rem',
  },
  typo: {
    fontSize: '2.25rem',
  },
  text1: {
    marginBottom: theme.spacing(3.75),
    width: '27.5rem',
  },
  typo1: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
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
    color: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7, 0),
    textAlign: 'center',
    width: '100%',
  },
  textError: {
    margin: '0 auto',
    marginTop: theme.spacing(13.75),
    width: '20.5rem',
  },
  typoSub: {
    fontSize: '1rem',
  },
}));
export default useStyles;
