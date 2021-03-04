import MuiAccordion from '@material-ui/core/Accordion';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootPanel: {
    display: 'inline-block',
    gap: 0,
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
  },

  rootPanelGroup: {
    width: '100%',
    display: 'inline-block',
    gap: 0,
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    paddingBottom: 0,
    marginBottom: theme.spacing(-3),
  },
  panelGroup: {
    display: 'flex',
    alignItems: 'left',
    background: theme.palette.cards.background,
  },
  // CardContent
  panelGroupTitle: {
    fontWeight: 700,
    fontSize: '1rem',
  },
  card: {
    background: theme.palette.cards.background,
    minWidth: '10.0rem',
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: '0.875rem',
    margin: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.secondary.main}`,
    boxSizing: 'border-box',
    '&:hover': {
      border: `1px solid ${theme.palette.secondary.dark}`,
      boxShadow: `0px 4px 4px ${theme.palette.highlight}80`,
    },
  },

  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
  },

  title: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(2.5),
  },
  singleGraph: { width: '25rem', height: '25rem' },
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
