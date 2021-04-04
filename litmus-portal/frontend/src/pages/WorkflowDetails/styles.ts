import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '0 auto',
  },

  // Back Button
  button: {
    margin: theme.spacing(0, 0, 0, -1),
  },

  // WorkflowName Header
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: theme.spacing(2, 0, 0, 0),
  },

  // Second Heading
  subtitle: {
    fontSize: '1rem',
    margin: theme.spacing(2, 0, 0, 0),
  },

  // AppBar and Tabs
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
  },

  // Graphical View
  graphView: {
    backgroundColor: theme.palette.cards.header,
    display: 'flex',
    flexDirection: 'column',
    height: '68vh',
    padding: '0.5rem 0.5rem',
  },

  nodesTable: {
    marginLeft: theme.spacing(-1.5),
  },

  infoDashboard: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
}));

export default useStyles;
