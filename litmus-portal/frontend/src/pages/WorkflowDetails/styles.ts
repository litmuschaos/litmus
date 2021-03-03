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
    margin: theme.spacing(2, 0, 0, 0),
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  // Second Heading
  subtitle: {
    margin: theme.spacing(2, 0, 0, 0),
    fontSize: '1rem',
  },

  // AppBar and Tabs
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
  },

  // Graphical View
  graphView: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem 0.5rem',
    height: '68vh',
    backgroundColor: theme.palette.cards.header,
  },

  nodesTable: {
    marginLeft: theme.spacing(-1.5),
  },

  infoDashboard: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },

  closeButton: {
    float: 'right',
    borderColor: theme.palette.border.main,
  },
}));

export default useStyles;
