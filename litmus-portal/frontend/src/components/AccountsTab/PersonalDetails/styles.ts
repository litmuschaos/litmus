import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Personal details
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
  },
  details: {
    maxWidth: '63.75rem',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    marginTop: theme.spacing(7.5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  details1: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },

    alignContent: 'flex-start',
    flexWrap: 'wrap',
  },
  orange: {
    width: '4.81rem',
    height: '4.81rem',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    marginBottom: theme.spacing(1.625),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  edit: {
    fontSize: '0.75rem',
    color: theme.palette.secondary.dark,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
      marginBottom: theme.spacing(2),
    },
  },
  input: {
    display: 'none',
    alignItems: 'center',
  },
  dp: {
    display: 'flex',
    flexDirection: 'column',

    marginRight: theme.spacing(2.5),
  },
  user: {
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '0.1875rem',
    width: '24.43rem',
    height: '4.8125rem',
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    paddingLeft: theme.spacing(3.75),
    marginBottom: theme.spacing(2.5),
  },

  // button styles for saving the changes of personal details
  saveButton: {
    marginLeft: theme.spacing(12.7),
    width: '7.0625rem',
  },

  submitButton: {
    display: 'inline',
    backgroundColor: theme.palette.secondary.dark,
    width: '6.875rem',
    height: '2.8125rem',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    textTransform: 'none',
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
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: '50.75rem',
    height: '39.1875rem',
    backgroundColor: theme.palette.background.paper,

    outline: 'none',
    borderRadius: '0.1875rem',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(15),
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
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  typo1: {
    fontSize: '1rem',
  },
}));
export default useStyles;
