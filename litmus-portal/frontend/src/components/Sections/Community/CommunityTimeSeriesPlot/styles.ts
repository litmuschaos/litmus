import { makeStyles } from '@material-ui/core/styles';

// CommunityTimeSeriesPlot Component Styling
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0.5),
    height: '2.5rem',
    width: '19.375rem',
  },

  root: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  plot: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
