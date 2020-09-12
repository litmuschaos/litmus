import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  cardsDiv: {
    marginTop: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
  },
}));

export default useStyles;
