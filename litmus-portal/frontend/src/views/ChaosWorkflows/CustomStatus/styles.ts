import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  completed: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.status.completed.text,
    backgroundColor: theme.palette.status.completed.background,
  },
  running: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(133, 140, 221, 0.1)',
  },
  failed: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.status.failed.text,
    backgroundColor: theme.palette.status.failed.background,
  },
  statusFont: {
    fontSize: '0.725rem',
  },
}));

export default useStyles;
