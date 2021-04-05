import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Status Text Colors
  running: {
    color: theme.palette.success.main,
  },

  failed: {
    color: theme.palette.error.main,
  },

  succeeded: {
    color: theme.palette.success.main,
  },

  pending: {
    color: theme.palette.text.primary,
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
