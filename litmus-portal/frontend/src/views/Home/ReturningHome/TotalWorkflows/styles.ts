import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '21.125rem',
    maxHeight: '12rem',
    padding: theme.spacing(3.25),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    // marginTop: theme.spacing(3.75),
    // marginLeft: theme.spacing(-6),
  },
  contentDiv: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-even',
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 2, 0, 2),
  },
  avgCount: {
    color: theme.palette.primary.main,
  },
  maxCount: {
    color: theme.palette.text.disabled,
  },
  workflow: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(3.125),
  },
  avgDesc: {
    fontSize: '0.875rem',
  },
  avatarStyle: {
    backgroundColor: theme.palette.primary.main,
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
