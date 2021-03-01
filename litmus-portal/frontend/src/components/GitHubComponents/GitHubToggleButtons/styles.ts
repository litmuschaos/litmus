import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toggleActive: {
    height: '2.25rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    width: '6.25rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  toggleInactive: {
    height: '2.25rem',
    backgroundColor: theme.palette.disabledBackground,
    color: theme.palette.text.hint,
    width: '6.25rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.disabledBackground,
    },
  },
  toggleFont: {
    fontSize: '0.875rem',
  },
}));

export default useStyles;
