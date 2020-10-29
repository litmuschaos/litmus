import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
    fontSize: '1.125rem',
  },
  expHeader: {
    fontWeight: 'bold',
    fontSize: '4.5rem',
    marginBottom: theme.spacing(1),
  },
  expInfo: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(4),
  },
  expDesc: {
    marginBottom: theme.spacing(1),
    maxWidth: '37.5rem',
    fontSize: '1rem',
  },
}));

export default useStyles;
