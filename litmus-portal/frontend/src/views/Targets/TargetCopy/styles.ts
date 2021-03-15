import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: '0.1875rem',
    marginTop: theme.spacing(4),
  },
  commandContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  copiedDiv: {
    textAlign: 'center',
    borderRadius: '0.1875rem',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.dark,
    padding: theme.spacing(1, 0),
  },
  command: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    color: theme.palette.text.hint,
    letterSpacing: 1,
    fontWeight: 500,
  },
  copyIcon: {
    paddingRight: theme.spacing(1),
  },
}));

export default useStyles;
