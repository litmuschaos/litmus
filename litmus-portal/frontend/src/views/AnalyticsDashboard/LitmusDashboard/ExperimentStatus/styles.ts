import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
