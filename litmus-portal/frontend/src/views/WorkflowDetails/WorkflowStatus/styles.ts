import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Status Text Colors
  running: {
    color: theme.palette.status.experiment.running,
  },

  failed: {
    color: theme.palette.status.experiment.failed,
  },

  succeeded: {
    color: theme.palette.status.experiment.completed,
  },

  pending: {
    color: theme.palette.status.experiment.pending,
  },

  error: {
    color: theme.palette.status.experiment.error,
  },

  skipped: {
    color: theme.palette.status.experiment.skipped,
  },

  omitted: {
    color: theme.palette.status.experiment.omitted,
  },

  textBold: {
    fontWeight: 'bold',
  },

  status: {
    display: 'flex',
    flexDirection: 'row',
  },

  icon: {
    marginRight: theme.spacing(1),
  },

  runningSmallIcon: {
    animation: 'runningNodeSpinAnimationSmall 2s ease-in-out infinite',
  },

  '@global': {
    '@keyframes runningNodeSpinAnimationSmall': {
      from: {
        transform: `rotate(0deg)`,
      },
      to: {
        transform: `rotate(360deg)`,
      },
    },
  },
}));

export default useStyles;
