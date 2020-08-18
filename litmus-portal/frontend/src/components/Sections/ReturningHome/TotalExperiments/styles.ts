import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '20.3125rem',
    height: '14.6875rem',
  },
  heading: {
    textAlign: 'center',
    marginTop: theme.spacing(3.75),
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
    paddingTop: theme.spacing(0.625),
  },
  workflow: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(3.125),
  },
  avgDesc: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(1.875),
    opacity: 0.5,
  },
}));

export default useStyles;
