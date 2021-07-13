import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    boxShadow: '0 5px 9px rgba(0, 0, 0, 0.1)',
  },
  popOver: {
    pointerEvents: 'none',
  },
  text: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

export default useStyles;
