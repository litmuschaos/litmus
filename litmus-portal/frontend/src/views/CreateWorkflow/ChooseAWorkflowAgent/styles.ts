import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    flexDirection: 'column',
    height: '100%',
    margin: '0 auto',
    padding: theme.spacing(0, 2),
  },

  // Inner Container
  innerContainer: {
    margin: theme.spacing(4, 'auto'),
    width: '95%', // Inner width of the container
  },

  // Header Div
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
  },
  subtitle: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.up('lg')]: {
      fontSize: '1rem',
      margin: theme.spacing(4, 0),
    },
  },
  check: {
    '&:hover': {
      shadow: theme.palette.secondary.dark,
    },
  },

  // Agent Div
  agentWrapperDiv: {
    display: 'grid',
    gridGap: '1.5rem',
    gridTemplateColumns: '1fr 1fr',
    marginTop: theme.spacing(5),
  },
  litmusCard: {
    background: theme.palette.cards.background,
  },
  agentRadioButton: {
    marginLeft: '5%',
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
