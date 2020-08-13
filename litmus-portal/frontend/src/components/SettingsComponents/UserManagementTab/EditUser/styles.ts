import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  headDiv: {
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3.75),
  },
  createDiv: {
    display: 'flex',
    alignItems: 'stretch',
  },
  divHeaderText: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    fontSize: '1.5625rem',
  },
  descText: {
    fontSize: '1rem',
    marginTop: theme.spacing(2.125),
  },
  backButton: {
    marginLeft: theme.spacing(-2),
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '63.75rem',
    marginTop: theme.spacing(3.75),
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
    maxWidth: '11rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
  },
  copyTypo: {
    marginTop: theme.spacing(1),
  },
  buttonGroup: {
    maxWidth: '63.75rem',
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(3.75),
    marginRight: theme.spacing(-4),
  },
}));
export default useStyles;
