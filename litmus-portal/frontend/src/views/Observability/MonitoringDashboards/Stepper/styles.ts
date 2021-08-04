import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '97.5%',
    margin: '0 auto',
    [theme.breakpoints.up('lg')]: {
      width: '98%',
      margin: theme.spacing(2, 'auto'),
    },
  },
  // Header
  headWrapper: {
    margin: theme.spacing(0.5, 'auto'),
  },
  header: {
    fontSize: '2.25rem',
    fontWeight: 500,
    lineHeight: '130%',
  },
  headerButtonWrapper: {
    display: 'flex',
    width: 'fit-content',
    justifyContent: 'space-between',
  },

  // Stepper
  icon: {
    marginRight: theme.spacing(1),
    width: '1rem',
  },

  // Bottom
  buttonText: {
    paddingRight: theme.spacing(1),
  },
}));

export default useStyles;
