import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: theme.spacing(40),
    height: theme.spacing(22),
    marginRight: theme.spacing(3),
    borderRadius: 3,
  },
  boxMain: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerMain: {
    fontWeight: 'bold',
    fontSize: theme.spacing(2),
    padding: theme.spacing(2),
    marginLeft: theme.spacing(3),
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
    height: theme.spacing(5),
    marginRight: theme.spacing(0.25),
    borderRadius: theme.spacing(0.3),
  },
  failedBox: {
    background: '#CA2C2C',
    borderRadius: theme.spacing(0.3),
  },
  passedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  failedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  passedLabel: {
    color: '#109B67',
    fontSize: theme.spacing(2.5),
    fontWeight: 'bold',
    width: '80%',
  },
  failedLabel: {
    color: '#CA2C2C',
    fontSize: theme.spacing(2.5),
    fontWeight: 'bold',
    width: '20%',
  },
}));

export default useStyles;
