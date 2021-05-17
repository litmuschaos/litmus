import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Status Text Colors
  running: {
    color: theme.palette.status.running.text,
  },

  failed: {
    color: theme.palette.status.failed.text,
  },

  succeeded: {
    color: theme.palette.status.completed.text,
  },

  pending: {
    color: theme.palette.status.completed.text,
  },

  error: {
    color: '#FFA600',
  },

  skipped: {
    color: '#0098DD',
  },

  omitted: {
    color: '#A93DDB',
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
