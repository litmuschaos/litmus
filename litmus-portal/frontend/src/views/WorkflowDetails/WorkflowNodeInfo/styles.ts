import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.cards.background,
    height: '25rem',
    padding: theme.spacing(4, 6, 6, 6),
    width: '100%',
  },

  header: {
    display: 'flex',
    height: '2rem',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: '1.5rem',
    margin: 'auto,0',
  },

  section: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  leftPanel: {
    margin: theme.spacing(3, 2, 0, 0),
    width: '25%',
  },

  rightPanel: {
    height: '16rem',
    width: '100%',
  },

  subSection: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(0, 0, 1, 0),
  },

  textMargin: {
    fontSize: '1rem',
    margin: theme.spacing(1, 0),
  },

  icon: {
    marginRight: theme.spacing(1),
  },

  runningStatusText: {
    color: theme.palette.highlight,
  },

  closeButton: {
    borderColor: theme.palette.border.main,
    cssFloat: 'right',
  },
}));

export default useStyles;
