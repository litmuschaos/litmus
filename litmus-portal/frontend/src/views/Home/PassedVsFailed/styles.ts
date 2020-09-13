import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '20.3125rem',
    height: '14.6875rem',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.contrastText,
  },
  boxMain: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerMain: {
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: theme.spacing(1.75),
    padding: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  boxDisplay: {
    display: 'flex',
    flexDirection: 'row',
    width: '80%',
    marginLeft: theme.spacing(4),
    padding: theme.spacing(1),
  },
  passedBox: {
    background: '#109B67',
    height: '2.5rem',
    marginRight: theme.spacing(0.25),
    borderRadius: theme.spacing(0.3),
  },
  failedBox: {
    background: '#CA2C2C',
    height: '2.5rem',
    borderRadius: theme.spacing(0.3),
  },
  passedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.primary.dark,
    width: 25,
    height: 25,
  },
  passedMark: {
    color: 'white',
    width: 25,
    height: 25,
  },
  failedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.error.dark,
    width: 25,
    height: 25,
  },
  failedMark: {
    color: 'white',
    width: 25,
    height: 25,
  },
  passedLabel: {
    color: theme.palette.primary.dark,
    fontSize: theme.spacing(2.5),
    fontWeight: 'bold',
    width: '80%',
  },
  failedLabel: {
    color: '#CA2C2C',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    width: '20%',
  },
  statsDesc: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(1.875),
    opacity: 0.5,
  },
}));

export default useStyles;
