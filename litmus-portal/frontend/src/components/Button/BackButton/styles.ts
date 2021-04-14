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
    fontSize: '1rem',
    margin: theme.spacing(0, 1),
    color: theme.palette.text.hint,
  },
}));

export default useStyles;
