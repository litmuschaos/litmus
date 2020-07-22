import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  success: {
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },

  error: {
    border: '0.0625rem solid',
    borderColor: theme.palette.error.main,
  },

  inputArea: {
    width: '20rem',
    marginTop: theme.spacing(3.5),
    textDecoration: 'none',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2.2),
    borderRadius: 3,
  },
}));

export default useStyles;
