import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.cards.background,
    padding: '1rem 1rem',
  },

  leftPanel: {
    marginRight: theme.spacing(2),
    width: '45%',
  },

  header: {
    fontSize: '1rem',
    marginBottom: theme.spacing(1),
  },

  subSection: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(0, 0, 1, 0),
  },

  text: {
    fontSize: '1rem',
  },

  topMarginBox: {
    display: 'flex',
    marginTop: theme.spacing(1),
  },

  icon: {
    marginRight: theme.spacing(1),
  },

  logsHeight: {
    width: '100%',
    height: '15rem',
  },

  runningStatusText: {
    color: theme.palette.highlight,
  },
}));

export default useStyles;
