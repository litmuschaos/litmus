import { makeStyles } from '@material-ui/core/styles';

// CommunityTimeSeriesPlot Component Styling
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0.5),
    height: theme.spacing(5),
    width: theme.spacing(38.75),
  },

  root: {
    height: theme.spacing(5),
    padding: theme.spacing(0.5),
  },

  plot: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
