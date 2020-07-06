import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  infoFilledDiv: {
    width: theme.spacing(30),
    height: theme.spacing(25),
    marginRight: theme.spacing(2),
    borderRadius: 3,
  },
  horizontalRule: {
    width: theme.spacing(14),
    opacity: 0.5,
  },
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
    fontWeight: 'bold',
  },
  statType: {
    textAlign: 'center',
    padding: '1rem 2rem',
    fontSize: '1rem',
    color: theme.palette.common.white,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  horizontalLine: {
    width: 120,
    opacity: 0.5,
  },
}));

export default useStyles;
