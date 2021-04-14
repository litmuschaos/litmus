import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    background: `linear-gradient(78.42deg, #403083 0.01%, #5B44BA 100.01%)`,
  },
  rootDiv: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    maxWidth: '49rem',
  },
  HeaderText: {
    maxWidth: '23.56rem',
    fontWeight: 500,
    fontSize: '2rem',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1.5, 0, 2.5, 0),
  },
  litmusText: {
    maxWidth: '23.56rem',
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  inputDiv: {
    maxWidth: '23.75rem',
    margin: theme.spacing(6, 0, 0, 7.5),
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
    textDecoration: 'underline',
  },
}));
export default useStyles;
