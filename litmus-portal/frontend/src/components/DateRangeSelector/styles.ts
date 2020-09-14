import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  popoverDateRangeSelector: {
    background: theme.palette.secondary.contrastText,
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    maxWidth: theme.spacing(70),
    [theme.breakpoints.down('sm')]: {
      maxWidth: theme.spacing(70),
    },
  },

  dateRangeSelectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    maxHeight: theme.spacing(70),
  },
}));

export default useStyles;
