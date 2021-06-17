import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(0, 2),
    margin: '0 auto',
    height: '100%',
    flexDirection: 'column',
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
    marginTop: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  litmusCard: {
    background: theme.palette.cards.background,
    margin: theme.spacing(2, 2, 2, 0),
  },
  agentRadioButton: {
    marginTop: theme.spacing(1),
    marginLeft: '5%',
  },
  infoContainerButton: {
    '& svg': {
      margin: theme.spacing(0, 1, -0.625, 0),
    },
    '& p': {
      fontWeight: 500,
    },
  },
  noAgents: {
    marginTop: theme.spacing(3.5),
    margin: 'auto',
    textAlign: 'center',
  },
  noAgentsText: {
    fontSize: '1.25rem',
  },
  connectAgent: {
    fontSize: '1rem',
  },
  connectBtn: {
    marginTop: theme.spacing(2.5),
  },
}));

export default useStyles;
