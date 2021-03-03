import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: 'inherit',
  },

  // Logs Box
  logs: {
    padding: theme.spacing(2),
    overflowY: 'scroll',
    height: '100%',
    margin: theme.spacing(2, 0, 0, 2),
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
  },
  text: {
    fontSize: '1rem',
  },
}));

export default useStyles;
