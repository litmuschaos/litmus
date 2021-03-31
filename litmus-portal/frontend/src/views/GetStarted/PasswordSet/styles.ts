import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rootLitmusText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
    fontWeight: 400,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '20rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(7.5),
  },
  inputValue: {
    margin: theme.spacing(1.875, 0, 1.875, 0),
    width: '100%',
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
  submitButton: {
    marginTop: theme.spacing(1.875),
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary,
    maxWidth: '8rem',
    '&:disabled': {
      PointerEvents: 'none',
      background: theme.palette.primary.light,
      color: theme.palette.text.secondary,
    },
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
  buttonGroup: {
    width: '100%',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
export default useStyles;
