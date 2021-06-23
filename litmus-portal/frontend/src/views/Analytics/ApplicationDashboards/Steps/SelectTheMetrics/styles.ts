import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: '1.8125rem',
    padding: theme.spacing(0, 5),
  },

  description: {
    width: '90%',
    margin: theme.spacing(0.5, 0, 2),
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.1176px',
    padding: theme.spacing(1, 5),
  },

  metricsForm: {
    background: theme.palette.background.paper,
    paddingBottom: theme.spacing(3),
  },
}));

export default useStyles;
