import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rootLitmusText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  HeaderText: {
    maxWidth: '23.56rem',
    fontWeight: 500,
    fontSize: '2rem',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1.5, 0, 2.5, 0),
  },
  litmusText: {
    maxWidth: '23.56rem',
    fontWeight: 400,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '20rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(7.5),
  },
  inputValue: {
    margin: theme.spacing(1.875, 0, 1.875, 0),
    width: '100%',
  },
  submitButton: {
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary,
  },
  buttonGroup: {
    marginTop: theme.spacing(3.75),
    width: '100%',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
export default useStyles;
