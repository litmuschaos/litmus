import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(3.5),
  },
  root: {
    width: '100%',
    padding: theme.spacing(4.375),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  radialChartContainer: {
    width: '22rem',
    borderRadius: '0.1875rem',
    marginBottom: theme.spacing(3.125),
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },
  formControl: {
    margin: theme.spacing(1, 3, 0, 2),
    minWidth: '9rem',
    '& fieldset': {
      height: '3.1875rem',
    },
  },
}));

export default useStyles;
