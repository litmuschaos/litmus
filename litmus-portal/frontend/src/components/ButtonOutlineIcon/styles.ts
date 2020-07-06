import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  buttonOutline: {
    display: 'flex',
    flexDirection: 'row',
    width: '10.435rem',
    height: '2.8125rem',
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },
  valueField: {
    fontSize: '0.75rem',
  },
}));
export default useStyles;
