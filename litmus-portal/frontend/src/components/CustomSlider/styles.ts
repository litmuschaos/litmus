import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  testHeading: {
    marginTop: theme.spacing(6.25),
    fontSize: '1.5625rem',
  },
  testType: {
    fontSize: '1.0625rem',
    paddingRight: theme.spacing(1.25),
  },
  testResult: {
    color: theme.palette.primary.dark,
    fontSize: '1.0625rem',
    paddingLeft: theme.spacing(1.25),
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(6.25),
  },
  sliderDiv: {
    width: '100%',
    marginBottom: theme.spacing(3.75),
  },
}));

export default useStyles;
