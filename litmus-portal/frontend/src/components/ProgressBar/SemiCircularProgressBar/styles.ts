import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: theme.spacing(40),
    height: theme.spacing(22),
    marginRight: theme.spacing(3),
    borderRadius: 3,
  },
  progressBox: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  progressIndicatorDiv: {
    transform: 'rotate(-90deg)',
    marginTop: theme.spacing(-3),
  },
  progressIndicator: {
    color: theme.palette.secondary.dark,
  },
  progressLabel: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: {
    borderRadius: '50%',
    background: theme.palette.secondary.main,
    padding: theme.spacing(1),
  },
  progressText: {
    color: theme.palette.grey[500],
    fontWeight: 'bold',
    fontSize: theme.spacing(3),
  },
}));

export default useStyles;
