import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  completed: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.primary.dark,
    backgroundColor: 'rgba(16, 155, 103, 0.1)',
  },
  running: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.secondary.dark,
    backgroundColor: 'rgba(133, 140, 221, 0.1)',
  },
  failed: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.error.dark,
    backgroundColor: theme.palette.error.light,
  },
  statusFont: {
    fontSize: '0.725rem',
  },
}));

export default useStyles;
