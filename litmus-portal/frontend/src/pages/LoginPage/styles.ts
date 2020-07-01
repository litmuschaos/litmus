import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  root: {
    marginTop: theme.spacing(8.75),
    marginLeft: theme.spacing(17.5),
    width: '25rem',
  },
  heading: {
    marginTop: theme.spacing(6.2),
    fontSize: theme.spacing(5),
  },
  description: {
    marginTop: theme.spacing(3.75),
    fontSize: '1rem',
  },
  inputArea: {
    marginTop: theme.spacing(3.75),
    display: 'flex',
    textDecoration: 'none',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(2.2),
    borderRadius: 3,
    border: '0.0625rem solid #5B44BA',
    borderLeft: '0.1875rem solid #5B44BA',
  },
  loginDiv: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(-2),
  },
  imageDiv: {
    width: '50%',
  },
  forgotPasssword: {
    marginTop: theme.spacing(3.125),
    marginBottom: theme.spacing(3.75),
  },
  inputDiv: {
    marginTop: theme.spacing(6.25),
  },
  linkForgotPass: {
    color: theme.palette.common.black,
  },
}));

export default useStyles;
