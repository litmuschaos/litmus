import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  userName: {
    fontSize: '2.5rem',
    margin: theme.spacing(1.75, 0, 2.75, 0),
  },
  firstRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
    },
    flexGrow: 1,
  },
}));

export default useStyles;
