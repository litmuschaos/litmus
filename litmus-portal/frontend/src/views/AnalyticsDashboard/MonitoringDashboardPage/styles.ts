import MuiAccordion from '@material-ui/core/Accordion';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootPanel: {
    background: theme.palette.background.paper,
    display: 'inline-block',
    margin: theme.spacing(3, 1),
    padding: theme.spacing(2),
  },

  rootPanelGroup: {
    background: theme.palette.background.paper,
    display: 'inline-block',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    paddingBottom: 0,
    width: '100%',
  },
  panelGroup: {
    alignItems: 'left',
    background: theme.palette.disabledBackground,
    display: 'flex',
  },
  panelGroupContainer: {
    background: theme.palette.cards.header,
    display: 'flex',
    justifyContent: 'space-around',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },

  panelGroupTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },

  title: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: '0.9rem',
    fontWeight: 700,
    paddingTop: theme.spacing(2.5),
    textAlign: 'center',
  },

  singleGraph: {
    // TODO remove this later
    '& hr': {
      position: 'relative !important',
    },
    height: '27.5rem',
    width: '32.5vw',
    [theme.breakpoints.down(1200)]: {
      width: '30vw',
    },
    [theme.breakpoints.down('sm')]: {
      width: '42.5vw',
    },
  },
}));

export const Accordion = withStyles({
  root: {
    border: 0,
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

export default useStyles;
