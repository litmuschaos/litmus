import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '63.75rem',
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
    border: 1,
    borderColor: theme.palette.primary.dark,
    borderRadius: 3,
    paddingBottom: theme.spacing(5),
  },

  suSegments: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-even',
    marginLeft: theme.spacing(5),
  },
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
  },
  // for login details
  details1: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
    alignContent: 'flex-start',
    flexWrap: 'wrap',
  },
  // for username field
  userDetail: {
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
    width: '24.43rem',
    height: '4.8125rem',
    marginRight: theme.spacing(2.5),
    paddingLeft: theme.spacing(3.75),
    marginBottom: theme.spacing(2.5),
  },

  // for password
  pass: {
    width: '24.43rem',
    height: '4.8125rem',
    marginBottom: theme.spacing(2.5),
    padding: theme.spacing(1),
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
  },

  divider: {
    marginTop: theme.spacing(3.75),
    maxWidth: '58.75rem',
  },

  txt1: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
    color: theme.palette.text.disabled,
  },

  // button success and button error
  success: {
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },

  error: {
    border: '0.0625rem solid',
    borderColor: theme.palette.error.main,
  },

  createRandomButton: {
    background: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    height: '2.75rem',
    '&:hover': {
      background: theme.palette.secondary.dark,
    },
  },

  // for copying the credentials
  copyDiv: {
    maxWidth: '10rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
  },

  buttonGroup: {
    display: 'flex',
    marginLeft: theme.spacing(7.5),
    marginTop: theme.spacing(3.75),
    flexGrow: 1,
    maxWidth: '63.75rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {},
  },
  button: {
    textTransform: 'none',
    width: '6.68rem',
    height: '2.75rem',
    borderRadius: 3,
    fontSize: '0.75rem',
    borderColor: theme.palette.secondary.dark,
  },
}));
export default useStyles;
