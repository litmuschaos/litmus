import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  value: {
    textAlign: 'center',
    paddingTop: theme.spacing(4),
    fontFamily: 'Ubuntu',
    fontSize: '2rem',
    color: theme.palette.common.white,
    fontWeight: 500,
  },
  plusBtn: {
    fontSize: '1.5rem',
    padding: '0.5rem 0.1rem',
    fontWeight: 'bold',
  },
  statType: {
    textAlign: 'center',
    padding: '1em 2em',
    fontSize: '1rem',
    color: theme.palette.common.white,
  },
}));

export default useStyles;
