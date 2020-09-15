import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
  },

  mainDiv: {
    background: theme.palette.action.hover,
    width: '100%',
    height: '100vh',
  },

  box: {
    maxWidth: '40rem',
    padding: '12% 5%',
    paddingLeft: theme.spacing(10),
    height: '100vh',
    overflowY: 'auto',
    margin: 'auto',
  },

  heading: {
    marginTop: theme.spacing(6.2),
    fontSize: theme.spacing(5),
  },

  description: {
    width: '80%',
    margin: '1.5rem 0',
    fontSize: '1rem',
  },

  loginDiv: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(-2),
  },

  imageDiv: {
    width: '100%',
    height: '100vh',
  },

  loginImage: {
    objectFit: 'cover',
    width: '100%',
    height: '100vh',
  },

  forgotPasssword: {
    marginTop: theme.spacing(3.125),
    marginBottom: theme.spacing(3.75),
  },

  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-2),
  },

  linkForgotPass: {
    color: theme.palette.common.black,
    opacity: 0.5,
  },

  descImg: {
    verticalAlign: 'middle',
    paddingLeft: theme.spacing(0.625),
  },
}));

export default useStyles;
