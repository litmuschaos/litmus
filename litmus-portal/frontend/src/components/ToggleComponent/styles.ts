import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toggleBtn: {
    width: '5.8125rem',
    height: '2.25rem',
    borderRadius: 3,
    border: theme.palette.common.white,
  },
  typography: {
    paddingLeft: theme.spacing(1),
  },
}));

export default useStyles;
