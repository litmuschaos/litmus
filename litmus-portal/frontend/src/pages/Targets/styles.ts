import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
  },
  header: {
    width: '100%',
    display: 'flex',
    margin: theme.spacing(5, 0, 2.5, 0),
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
