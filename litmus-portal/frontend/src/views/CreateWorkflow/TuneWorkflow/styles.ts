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

  // Header
  headerWrapper: {
    padding: theme.spacing(0, 4),
  },

  heading: {
    marginTop: theme.spacing(3),
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  headerBtn: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '30%',
  },

  descriptionWrapper: {
    padding: theme.spacing(3, 0),
    justifyContent: 'space-between',
  },

  description: {
    width: '70%',
    fontSize: '1rem',
  },

  // Header Buttons [View YAML, Add Exp]
  btn1: {
    border: 'none !important',
    color: theme.palette.highlight,
  },

  // Experiment Section
  experimentWrapper: {
    background: theme.palette.cards.header,
    padding: theme.spacing(2, 4),
  },
}));

export default useStyles;
