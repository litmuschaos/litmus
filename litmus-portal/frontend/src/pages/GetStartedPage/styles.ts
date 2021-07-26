import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
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
    '& .MuiFormHelperText-root': {
      background: theme.palette.loginBackground,
      marginTop: 0,
    },
    '& .MuiFormHelperText-contained': {
      margin: 0,
    },
  },
  submitButton: {
    padding: theme.spacing(1.25, 4),
    marginTop: theme.spacing(1.875),
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary,
    '&:disabled': {
      PointerEvents: 'none',
      background: theme.palette.primary.light,
      color: theme.palette.text.secondary,
    },
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
  skipButton: {
    padding: theme.spacing(1.25, 0),
    marginTop: theme.spacing(1.875),
    color: theme.palette.text.secondary,
  },
  buttonGroup: {
    width: '25rem',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    marginTop: theme.spacing(1.875),
  },
  logo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
}));
export default useStyles;
