import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(2.5, 1.5, 0, 1.5),
  },
  content: {
    borderRadius: '0.1875rem',
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
  connectTarget: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  loader: {
    display: 'flex',
    margin: theme.spacing(6, 0, 0, 10),
    textalign: 'center',
  },
  linkTargetImg: {
    paddingTop: theme.spacing(2),
  },
}));

export default useStyles;
