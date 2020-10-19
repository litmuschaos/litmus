import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Personal details
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
  },
  input: {
    display: 'none',
    alignItems: 'center',
  },
  // button styles for saving the changes of personal details
  saveButton: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(12.4),
    width: '7.0625rem',
  },
  // for closing the modal button
  button: {
    textTransform: 'none',
    width: '8.5rem',
    height: '2.93rem',
    borderRadius: 0,
    marginTop: theme.spacing(1.25),
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  // styles for modal and its components
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(15),
    paddingBottom: '7rem',
    color: theme.palette.personalDetailsBodyColor,
  },
  text: {
    width: '31rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2.25rem',
  },
  text1: {
    width: '27.5rem',
    marginBottom: theme.spacing(3.75),
  },
  typo1: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },
  buttonModal: {
    marginTop: theme.spacing(3.75),
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
  textError: {
    width: '20.5rem',
    marginTop: theme.spacing(13.75),
    margin: '0 auto',
  },
  typoSub: {
    fontSize: '1rem',
  },
}));
export default useStyles;
