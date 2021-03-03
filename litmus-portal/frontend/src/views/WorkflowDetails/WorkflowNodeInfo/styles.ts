import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.cards.background,
    padding: '1rem 1rem',
  },

  leftPanel: {
    width: '45%',
    marginRight: theme.spacing(2),
  },

  workflowHeader: {
    fontSize: '1rem',
    marginBottom: theme.spacing(1),
  },

  heightMaintainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    lineHeight: '2rem',
    justifyContent: 'space-between',
  },

  subSection: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(0, 0, 1, 0),
  },

  text: {
    fontSize: '1rem',
  },

  status: {
    display: 'flex',
  },

  marginTop: {
    display: 'flex',
    marginTop: theme.spacing(1),
  },

  icon: {
    marginRight: theme.spacing(1),
  },

  logsHeight: {
    width: '100%',
    height: '15rem',
  },

  runningStatusText: {
    color: theme.palette.highlight,
  },

  runningSmallIcon: {
    animation: 'runningSmallNodeSpinAnimation 2s ease-in-out infinite',
  },
  '@global': {
    '@keyframes runningSmallNodeSpinAnimation': {
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
