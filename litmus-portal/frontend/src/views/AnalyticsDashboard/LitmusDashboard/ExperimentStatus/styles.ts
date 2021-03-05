import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
