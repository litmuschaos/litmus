import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2.5),
  },
  scheduleBtn: {
    marginLeft: 'auto',
  },
  customTooltip: {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.text.primary,
    fontSize: '0.775rem',
  },
}));

export default useStyles;
