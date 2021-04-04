import { makeStyles } from '@material-ui/core/styles';

// CommunityTimeSeriesPlot Component Styling
const useStyles = makeStyles((theme) => ({
  formControl: {
    height: '2.5rem',
    margin: theme.spacing(0.5),
    width: '19.375rem',
    [theme.breakpoints.down('sm')]: {
      width: '15rem',
    },
  },

  plotCard: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },

  root: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  plot: {
    margin: 'auto',
    marginTop: theme.spacing(2),
    paddingLeft: '4.5%',
    width: '150%',
  },
}));

export default useStyles;
