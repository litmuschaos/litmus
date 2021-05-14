import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  icon: {
    margin: theme.spacing(0, 1),
    width: '1rem',
  },
  button: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoText: {
    paddingRight: theme.spacing(1.5),
  },
}));

export default useStyles;
