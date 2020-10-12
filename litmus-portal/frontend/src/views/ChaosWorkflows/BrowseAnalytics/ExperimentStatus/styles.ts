import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  passed: {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.customColors.menuOption.active,
  },
  awaited: {
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.waitingStatusColor,
  },
  failed: {
    color: theme.palette.error.dark,
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
    backgroundColor: theme.palette.secondary.contrastText,
    width: '0.9375rem',
    height: '0.9375rem',
  },
  stateIcon: {
    width: '0.9375rem',
    height: '0.9375rem',
  },
  cancelIcon: {
    color: theme.palette.error.dark,
  },
  checkIcon: {
    color: theme.palette.primary.dark,
  },
}));

export default useStyles;
