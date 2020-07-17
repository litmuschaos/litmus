import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  toggleBtn: {
    width: theme.spacing(12),
    height: theme.spacing(5),
    borderRadius: 3,
    border: theme.palette.common.white,
  },
  typography: {
    paddingLeft: theme.spacing(1),
  },
}));

export default useStyles;
