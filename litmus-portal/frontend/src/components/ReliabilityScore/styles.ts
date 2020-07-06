import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '61.25rem',
    marginTop: theme.spacing(8.75),
    marginLeft: theme.spacing(17.5),
    border: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
  },
  mainDiv: {
    paddingLeft: theme.spacing(3.75),
    paddingRight: theme.spacing(3.75),
    paddingTop: theme.spacing(3.75),
  },
  headerText: {
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
  },
  description: {
    width: '50rem',
    marginTop: theme.spacing(3.25),
    fontSize: '1.0625rem',
  },
  testHeading: {
    marginTop: theme.spacing(6.25),
    fontSize: '1.5625rem',
  },
  testInfo: {
    fontSize: '0.9375rem',
    opacity: 0.4,
    width: '30rem',
    marginLeft: theme.spacing(8),
  },
  horizontalLine: {
    marginTop: theme.spacing(7.5),
    marginBottom: theme.spacing(1.25),
    borderColor: 'rgba(0, 0, 0, 0.1);',
  },
  modalDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  buttonOutlineDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonOutlineText: {
    paddingLeft: theme.spacing(1.5),
  },
}));

export default useStyles;
