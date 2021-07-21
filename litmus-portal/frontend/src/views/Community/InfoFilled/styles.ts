import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  infoFilledDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '6.25rem',
    borderRadius: 3,
    [theme.breakpoints.down('sm')]: {
      width: '15rem',
    },
  },
  infoFilledWrap: {
    display: 'flex',
    flexDirection: 'row',
    height: '6.25rem',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
  },
  imgTextWrap: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    cursor: 'pointer',
    '& img': {
      width: '1.5rem',
      height: '1.5rem',
      marginRight: theme.spacing(1),
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
    fontSize: '1.5rem',
    color: theme.palette.text.primary,
  },
  plusBtn: {
    fontSize: '1.5rem',
    fontWeight: 'normal',
  },
  statType: {
    textAlign: 'center',
    fontSize: '1rem',
    color: theme.palette.text.primary,
    padding: theme.spacing(0, 2),
  },
  horizontalLine: {
    width: 120,
    opacity: 0.5,
  },
}));

export default useStyles;
