import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  buttonOutline: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '4.375rem',
    height: '2.3rem',
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  valueField: {
    fontSize: '0.75rem',
  },
}));

export default useStyles;
