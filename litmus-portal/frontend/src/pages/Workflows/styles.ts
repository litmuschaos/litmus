import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    color: theme.palette.text.primary,
    margin: theme.spacing(1, 0, 2, 0),
  },
  scheduleBtn: {
    marginLeft: 'auto',
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    marginBottom: theme.spacing(1),
  },
}));

export default useStyles;
