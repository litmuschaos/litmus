import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },

  // Logs Heading
  logsHeading: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginLeft: '1rem',
  },

  // Logs Box
  logs: {
    padding: theme.spacing(1.5),
    overflowY: 'scroll',
    [theme.breakpoints.up('lg')]: {
      height: '15rem',
    },
    margin: theme.spacing(2, 0, 0, 2),
    height: '100%',
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
    textAlign: 'left',
  },
  text: {
    fontSize: '1rem',
  },
}));

export default useStyles;
