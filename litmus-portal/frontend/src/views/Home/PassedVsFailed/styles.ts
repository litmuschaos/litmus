import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '20.3125rem',
    height: '14.6875rem',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
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
    background: theme.palette.success.main,
    height: '2.5rem',
    marginRight: theme.spacing(0.25),
    borderRadius: theme.spacing(0.3),
  },
  failedBox: {
    background: theme.palette.error.main,
    height: '2.5rem',
    borderRadius: theme.spacing(0.3),
  },
  passedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.success.main,
    width: '1.5625rem',
    height: '1.5625rem',
  },
  passedMark: {
    color: theme.palette.text.secondary,
    width: '1.5625rem',
    height: '1.5625rem',
  },
  failedIcon: {
    marginTop: theme.spacing(1),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.error.main,
    width: '1.5625rem',
    height: '1.5625rem',
  },
  failedMark: {
    color: theme.palette.text.secondary,
    width: '1.5625rem',
    height: '1.5625rem',
  },
  passedLabel: {
    color: theme.palette.success.main,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    width: '82.5%',
  },
  failedLabel: {
    color: theme.palette.error.main,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    width: '17.5%',
  },
  statsDesc: {
    marginLeft: theme.spacing(4.375),
    marginTop: theme.spacing(1.875),
    opacity: 0.6,
  },
}));

export default useStyles;
