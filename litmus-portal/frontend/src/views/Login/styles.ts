import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    background: theme.palette.loginBackground,
  },
  rootDiv: {
    margin: '0 auto',
    alignItems: 'center',
    width: '50%',
    zIndex: 999,
  },
  heading: {
    fontWeight: 500,
    fontSize: '1.5rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  subheading: {
    marginTop: '1rem',
    maxWidth: '23.75rem',
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    margin: '0 auto',
  },
  logo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
}));
export default useStyles;
