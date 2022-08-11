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
    margin: theme.spacing(3, 0),
    fontSize: '1.5rem',
  },

  desc: {
    fontSize: '0.875rem',
    width: '80%',
    color: theme.palette.text.hint,
  },

  viewAll: {
    fontSize: '0.775rem',
    color: theme.palette.primary.main,
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    marginLeft: theme.spacing(10),
    cursor: 'pointer',
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
    marginBottom: theme.spacing(1),
  },

  // Graphical View
  graphView: {
    display: 'flex',
    flexDirection: 'column',
    height: '65vh',
    backgroundColor: theme.palette.cards.header,
  },

  infoDashboard: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
}));

export default useStyles;
