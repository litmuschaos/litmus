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
    // marginLeft: 'auto',
    // padding: theme.spacing(3.125, 2.5),
    borderRadius: '0.1875rem',
  },
  radialChart: {
    // width: '20.475rem',
    // height: '19.9375rem',
  },
}));

export default useStyles;
