import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  topDesign: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  rootContainer: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    background: theme.palette.loginBackground,
  },
  rootDiv: {
    margin: '0 auto',
    alignItems: 'center',
    width: '50%',
    zIndex: 999,
  },
  heading: {
    fontWeight: 500,
    fontSize: '1.5rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  subheading: {
    marginTop: '1rem',
    maxWidth: '23.75rem',
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    margin: '0 auto',
  },
  inputDiv: {
    maxWidth: '23.75rem',
    margin: '2rem auto',
  },
  inputValue: {
    marginBottom: theme.spacing(1.75),
    width: '100%',
    borderRadius: '0.25rem',
    background: theme.palette.background.paper,
    '& .MuiInputLabel-filled': {
      color: theme.palette.text.hint,
    },
    '& .MuiFilledInput-input': {
      background: theme.palette.background.paper,
    },
    '& .MuiFormHelperText-root': {
      background: theme.palette.primary.main,
      marginTop: 0,
    },
    '& .MuiFormHelperText-contained': {
      margin: 0,
    },
  },
  loginButton: {
    marginTop: theme.spacing(1.875),
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary,
    maxWidth: '8rem',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  buttonGroup: {
    width: '100%',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltip: {
    padding: theme.spacing(3.75, 1.875),
    maxWidth: '12.5rem',
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },
  forgetPwdText: {
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
  },
  logo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
}));
export default useStyles;
