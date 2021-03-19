import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Logs Box
  logs: {
    width: '100%',
    padding: theme.spacing(2),
    overflowY: 'scroll',
    height: '100%',
    margin: theme.spacing(2, 0, 0, 2),
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
  },
  text: {
    fontSize: '1rem',
    padding: theme.spacing(2.5),
  },
  crossMark: {
    color: theme.palette.common.white,
  },
}));

export default useStyles;
