import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(4, 0),
    margin: '0 auto',
    width: '88%',
    height: '100%',
    [theme.breakpoints.up('lg')]: {
      width: '87%',
    },
  },

  headerWrapper: {
    padding: theme.spacing(0, 4),
  },

  heading: {
    marginTop: theme.spacing(3),
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  description: {
    width: '70%',
    padding: theme.spacing(3, 0),
    fontSize: '1rem',
  },
}));

export default useStyles;
