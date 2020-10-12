import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
  },
  toggleBtn: {
    width: theme.spacing(10),
    height: '2.25rem',
    borderRadius: 3,
    border: theme.palette.common.white,
  },
  typography: {
    paddingLeft: theme.spacing(1),
  },
}));

export default useStyles;
