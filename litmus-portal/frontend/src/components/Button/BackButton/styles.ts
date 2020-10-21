import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  btn: {
    display: 'flex',
    textTransform: 'none',
    '&:hover': {
      background: 'none',
    },
  },
  text: {
    opacity: 0.5,
    fontSize: '1rem',
    margin: theme.spacing(0, 1),
  },
}));

export default useStyles;
