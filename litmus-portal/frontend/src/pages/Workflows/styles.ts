import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
  scheduleBtn: {
    marginLeft: 'auto',
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
  },
}));

export default useStyles;
