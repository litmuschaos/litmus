import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  popoverDateRangeSelector: {
    background: theme.palette.secondary.contrastText,
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    maxWidth: '35rem',
  },

  dateRangeSelectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    maxHeight: '35rem',
  },
}));

export default useStyles;
