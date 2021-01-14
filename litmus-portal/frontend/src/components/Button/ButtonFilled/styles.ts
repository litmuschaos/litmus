import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  button: {
    display: 'inline',
    minWidth: '6.875rem',
    height: '2.8125rem',
    color: theme.palette.common.white,
    textTransform: 'none',
  },
  buttonPrimary: {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  buttonSecondary: {
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  buttonWarning: {
    backgroundColor: theme.palette.error.dark,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

export default useStyles;
