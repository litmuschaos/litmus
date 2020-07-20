import { makeStyles } from '@material-ui/core/styles';

// CommunityTimeSeriesPlot Component Styling
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0.5),
    height: '35px',
    width: theme.spacing(38.75),
  },

  root: {
    height: '35px',
    padding: '5px 5px',
  },

  plot: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
