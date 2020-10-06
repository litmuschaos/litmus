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
    backgroundColor: theme.palette.secondary.dark,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  buttonSecondary: {
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default useStyles;
