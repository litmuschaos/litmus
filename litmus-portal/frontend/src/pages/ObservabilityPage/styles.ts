import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2.5),
  },
  headingText: {
    fontWeight: 400,
    fontSize: '2rem',
  },
  appBar: {
    boxShadow: 'none',
    position: 'static',
    backgroundColor: 'inherit',
  },
}));

export default useStyles;
