import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  testHeading: {
    marginTop: theme.spacing(6.25),
    fontSize: theme.spacing(2),
  },
  testType: {
    fontSize: theme.spacing(2),
  },
  testResult: {
    color: theme.palette.primary.dark,
    fontSize: theme.spacing(2),
    fontWeight: 'bold',
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(6.25),
  },
  horizontalRule: {
    margin: '0 2rem',
    padding: 0,
    transform: 'rotate(90deg)',
  },
  sliderDiv: {
    width: theme.spacing(100),
    marginBottom: theme.spacing(3.75),
  },
}));

export default useStyles;
