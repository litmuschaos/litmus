import MuiAccordion from '@material-ui/core/Accordion';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootPanel: {
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    margin: theme.spacing(3, 1),
  },

  rootPanelGroup: {
    width: '100%',
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    paddingBottom: 0,
    marginBottom: theme.spacing(1),
  },
  panelGroup: {
    display: 'flex',
    alignItems: 'left',
    background: theme.palette.disabledBackground,
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
    fontWeight: 700,
    fontSize: '1rem',
  },

  title: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(2.5),
  },

  singleGraph: {
    width: '32.5vw',
    height: '27.5rem',
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
