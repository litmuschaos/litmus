import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2.5),
  },
  scheduleBtn: {
    marginLeft: 'auto',
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

export default useStyles;
