import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginTop: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: theme.palette.text.secondary,
    height: '5.3125rem',
    position: 'relative',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '5px',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },
  footerIconWrapper: { width: '20rem', display: 'flex-root' },
  footerIconButton: {
    cursor: 'pointer',
    background: 'transparent',
    border: 0,
    width: '2rem',
    height: '2rem',
    verticalAlign: 'middle',
    marginRight: theme.spacing(2),
    '& img': { width: '2rem', height: '2rem' },
  },

  footerText: {
    width: '20rem',
    '& span': {
      color: theme.palette.text.primary,
      fontStyle: 'normal',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      lineHeight: '150%',
      textAlign: 'center',
    },
  },
}));

export default useStyles;
