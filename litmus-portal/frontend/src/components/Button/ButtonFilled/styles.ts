import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  buttonPrimary: {
    display: 'inline',
    backgroundColor: theme.palette.secondary.dark,
    minWidth: '6.875rem',
    height: '2.8125rem',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    textTransform: 'none',
  },
  buttonSecondary: {
    display: 'inline',
    backgroundColor: theme.palette.primary.dark,
    minWidth: '6.875rem',
    height: '2.8125rem',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    textTransform: 'none',
  },
}));

export default useStyles;
