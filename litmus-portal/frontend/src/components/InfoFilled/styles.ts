import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  infoFilledDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: theme.spacing(30),
    height: theme.spacing(12.5),
    marginRight: theme.spacing(3),
    borderRadius: 3,
    [theme.breakpoints.down('sm')]: {
      width: '15rem',
    },
  },
  infoFilledWrap: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(30),
    height: theme.spacing(12.5),
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
  value: {
    textAlign: 'center',
    paddingTop: theme.spacing(2),
    letterSpacing: theme.spacing(0.3),
    fontWeight: 'normal',
    fontSize: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  plusBtn: {
    fontSize: theme.spacing(3),
    fontWeight: 'normal',
  },
  statType: {
    textAlign: 'center',
    fontSize: theme.spacing(2),
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  horizontalLine: {
    width: 120,
    opacity: 0.5,
  },
}));

export default useStyles;
