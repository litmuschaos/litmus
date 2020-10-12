import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  infoFilledDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: theme.spacing(30),
    height: theme.spacing(22),
    marginRight: theme.spacing(3),
    borderRadius: 3,
    [theme.breakpoints.down('sm')]: {
      width: theme.spacing(40),
    },
  },
  infoFilledWrap: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(30),
    height: theme.spacing(22),
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
  },
  errorMessage: {
    marginLeft: theme.spacing(10),
  },
  horizontalRule: {
    width: theme.spacing(14),
    opacity: 0.5,
  },
  value: {
    textAlign: 'center',
    paddingTop: theme.spacing(4),
    fontFamily: 'Ubuntu',
    letterSpacing: theme.spacing(0.3),
    fontWeight: 'bold',
    fontSize: theme.spacing(4),
    color: theme.palette.common.white,
  },
  plusBtn: {
    fontSize: theme.spacing(2.5),
    fontWeight: 'bold',
  },
  statType: {
    textAlign: 'center',
    fontSize: theme.spacing(2),
    color: theme.palette.common.white,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  horizontalLine: {
    width: 120,
    opacity: 0.5,
  },
}));

export default useStyles;
