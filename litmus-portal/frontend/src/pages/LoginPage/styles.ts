import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  root: {
    display: 'flex',
    flexDirection: 'row',
  },

  rootDiv: {
    flexGrow: 1,
  },

  mainDiv: {
    marginTop: theme.spacing(8.75),
    marginLeft: theme.spacing(23),
    maxWidth: '26rem',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(5),
    },
  },

  heading: {
    marginTop: theme.spacing(6.2),
    fontSize: theme.spacing(5),
  },

  description: {
    marginTop: theme.spacing(3.75),
    fontSize: '1rem',
  },
  description2: {
    marginTop: theme.spacing(1),
    fontSize: '1rem',
  },

  loginDiv: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(-2),
  },

  imageDiv: {
    marginLeft: 'auto',
  },

  forgotPasssword: {
    marginTop: theme.spacing(3.125),
    marginBottom: theme.spacing(3.75),
  },

  inputDiv: {
    marginTop: theme.spacing(1),
  },

  linkForgotPass: {
    color: theme.palette.common.black,
    opacity: 0.5,
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

  descImg: {
    verticalAlign: 'middle',
    paddingLeft: theme.spacing(0.625),
  },
}));

export default useStyles;
