import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  status: {
    width: '3.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
  },
  completed: {
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light,
  },
  running: {
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light,
  },
  failed: {
    color: theme.palette.status.workflow.failed,
    backgroundColor: theme.palette.status.workflow.failed,
  },
  statusFont: {
    fontSize: '0.725rem',
  },
}));

export default useStyles;
