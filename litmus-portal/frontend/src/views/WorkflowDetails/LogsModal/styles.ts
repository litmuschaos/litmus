import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '41rem',
  },

  // Header
  header: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    display: 'flex',
    height: '8rem',
    padding: theme.spacing(1, 0, 1, 2),
  },

  // Header title
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  // Section
  section: {
    display: 'flex',
    height: '39rem',
  },

  // Left side panel for Nodes data
  nodesData: {
    height: '100%',
    paddingTop: theme.spacing(13),
    width: '35%',
  },

  selectedNode: {
    backgroundColor: theme.palette.cards.header,
  },

  // One Node data
  nodeData: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    height: '4rem',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 2, 2),
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
    textAlign: 'left',
    width: '30%',
  },

  // Right side panel for Logs
  logsPanel: {
    borderLeft: `1px solid ${theme.palette.border.main}`,
    textAlign: 'left',
    width: '100%',
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
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 0, 2),
  },

  logsHeight: {
    height: '32rem',
  },
}));

export default useStyles;
