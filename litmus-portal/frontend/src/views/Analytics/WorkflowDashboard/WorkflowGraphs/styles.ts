import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '24.875rem',
    padding: theme.spacing(4.375),
  },
  radialChartContainer: {
    width: '20rem',
    height: '15rem',
    borderRadius: '0.1875rem',
  },
}));

export default useStyles;
