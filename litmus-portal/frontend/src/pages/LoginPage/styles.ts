import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    background: theme.palette.primary.main,
  },
  rootDiv: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    maxWidth: '49rem',
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
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  inputDiv: {
    maxWidth: '23.75rem',
    margin: theme.spacing(6, 0, 0, 7.5),
  },
  inputValue: {
    marginBottom: theme.spacing(1.75),
    width: '100%',
    borderRadius: '0.25rem',
  },
  loginButton: {
    marginTop: theme.spacing(1.875),
    background: theme.palette.primary.light,
    color: theme.palette.text.secondary,
    maxWidth: '8rem',
  },
}));
export default useStyles;
