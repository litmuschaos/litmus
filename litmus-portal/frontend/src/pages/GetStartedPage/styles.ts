import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    background: theme.palette.primary.main,
  },
}));
export default useStyles;
