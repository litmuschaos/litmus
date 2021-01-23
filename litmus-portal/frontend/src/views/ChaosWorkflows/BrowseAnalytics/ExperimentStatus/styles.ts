import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  passed: {
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light,
  },
  awaited: {
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light,
  },
  failed: {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.light,
  },
  awaitedSpan: {
    marginLeft: theme.spacing(2),
  },
  state: {
    width: '4.75rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  statusFont: {
    fontSize: '0.725rem',
  },
  miniIcons: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.2),
    display: 'block',
    backgroundColor: theme.palette.common.white,
    width: '0.9375rem',
    height: '0.9375rem',
  },
  stateIcon: {
    width: '0.9375rem',
    height: '0.9375rem',
  },
  cancelIcon: {
    color: theme.palette.error.main,
  },
  checkIcon: {
    color: theme.palette.success.main,
  },
}));

export default useStyles;
