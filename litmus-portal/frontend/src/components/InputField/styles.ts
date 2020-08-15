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
    width: theme.spacing(45),
    marginTop: theme.spacing(2),
    textDecoration: 'none',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2.2),
    borderRadius: 3,
  },
  passwordDiv: {
    margin: 0,
    padding: 0,
  },
}));

export default useStyles;
