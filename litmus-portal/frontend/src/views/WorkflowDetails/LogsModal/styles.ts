import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '43rem',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '8rem',
    padding: theme.spacing(1, 0, 1, 2),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },

  // Header title
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  // Section
  section: {
    display: 'flex',
    height: '35rem',
  },

  // Left side panel for Nodes data
  nodesData: {
    paddingTop: theme.spacing(13),
    width: '35%',
    height: '100%',
  },

  selectedNode: {
    backgroundColor: theme.palette.cards.header,
  },

  // One Node data
  nodeData: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 2, 2),
    height: '4rem',
    alignItems: 'center',
    cursor: 'pointer',
  },

  // Experiment
  experiment: {
    display: 'flex',
    width: '60%',
  },

  // Node Title
  nodeName: {
    fontSize: '1rem',
  },

  // Icon with right margin
  icon: {
    marginRight: theme.spacing(1),
  },

  statusWidth: {
    width: '30%',
    textAlign: 'left',
  },

  // Right side panel for Logs
  logsPanel: {
    width: '100%',
    textAlign: 'left',
    borderLeft: `1px solid ${theme.palette.border.main}`,
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

  logsHeight: {
    height: '27rem',
  },
}));

export default useStyles;
