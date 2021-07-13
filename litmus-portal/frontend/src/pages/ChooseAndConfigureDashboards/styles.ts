import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  center: {
    padding: '25%',
  },

  loading: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    color: theme.palette.text.hint,
    fontSize: '1.25rem',
  },

  error: {
    textAlign: 'center',
    color: theme.palette.error.main,
    fontSize: '1rem',
  },
}));

export default useStyles;
