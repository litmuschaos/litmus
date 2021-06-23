import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.text.primary,
    margin: theme.spacing(1, 0, 2.5, 0),
  },
  appBar: {
    boxShadow: 'none',
    position: 'static',
    backgroundColor: 'inherit',
  },
}));

export default useStyles;
