import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(0, 2, 2, 2),
  },

  // Header
  header: {
    alignItems: 'center',
    display: 'flex',
    height: '8rem',
  },

  // Header title
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  // Section
  section: {
    display: 'flex',
    width: '100%',
  },

  // Left side panel for Nodes data
  nodesData: {
    margin: theme.spacing(7, 2, 2, 2),
    width: '35%',
  },

  // One Node data
  nodeData: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },

  // Experiment
  experiment: {
    display: 'flex',
    width: '60%',
  },

  // Node Title
  nodeName: {
    cursor: 'pointer',
    fontSize: '1rem',
  },

  // Icon with right margin
  icon: {
    marginRight: theme.spacing(1),
  },

  // Right side panel for Logs
  logsPanel: {
    width: '100%',
    textAlign: 'left',
  },

  // Close Button
  closeButton: {
    borderColor: theme.palette.border.main,
  },

  subLogsHeader: {
    color: theme.palette.text.disabled,
  },

  // Logs Header
  logsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 0, 2),
  },
}));

export default useStyles;
