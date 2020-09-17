import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '20.3125rem',
    height: '14.6875rem',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.homePageCardBackgroundColor,
  },
  heading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(-6),
  },
  contentDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(2.5),
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2.5),
  },
  avgCount: {
    color: theme.palette.secondary.dark,
  },
  maxCount: {
    color: theme.palette.text.disabled,
  },
  workflow: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(3.125),
  },
  avgDesc: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(1.875),
    opacity: 0.6,
  },
  avatarStyle: {
    backgroundColor: theme.palette.secondary.dark,
    width: '2.5rem',
    height: '2.5rem',
    marginTop: theme.spacing(0.625),
  },
  weeklyIcon: {
    width: '0.9375rem',
    height: '0.9375rem',
  },
  runsFlex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

export default useStyles;
