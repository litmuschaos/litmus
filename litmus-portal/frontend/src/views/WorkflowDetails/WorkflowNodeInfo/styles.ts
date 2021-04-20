import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '21.75rem',
    width: '100%',
    backgroundColor: theme.palette.cards.background,
    padding: theme.spacing(4),
  },

  header: {
    height: '1.688rem',
    display: 'flex',
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
    maxWidth: '30%',
  },

  rightPanel: {
    width: '70%',
    height: '14.125rem',
  },

  subSection: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(0, 0, 1, 0),
  },

  textMargin: {
    fontSize: '0.75rem',
    margin: theme.spacing(1, 0),
  },

  buttonAlign: {
    paddingLeft: theme.spacing(0),
    color: theme.palette.text.primary,
    fontSize: '1.125rem',
  },

  icon: {
    marginRight: theme.spacing(1),
  },

  runningStatusText: {
    color: theme.palette.highlight,
  },

  closeButton: {
    borderColor: theme.palette.border.main,
    float: 'right',
    height: '0.451rem',
  },
}));

export default useStyles;
