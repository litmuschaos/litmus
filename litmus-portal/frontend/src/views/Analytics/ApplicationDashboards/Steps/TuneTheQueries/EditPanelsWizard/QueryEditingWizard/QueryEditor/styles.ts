import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2, 2, 0),
  },

  query: {
    flexDirection: 'row-reverse',
    background: theme.palette.cards.header,
    borderRadius: '0.32rem',
  },

  queryContainer: {
    position: 'relative',
    width: '100%',
    background: theme.palette.background.paper,
    padding: theme.spacing(3.5, 5, 1),
  },

  queryTitle: {
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.1176px',
    color: theme.palette.highlight,
  },

  iconButton: {
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    display: 'flex',
    padding: theme.spacing(0.35, 0.85, 0.15),
  },

  icon: {
    width: '1rem',
    height: '1rem',
  },

  // Form Select Properties
  formControl: {
    height: '3.25rem',
  },

  selectTextLabel: {
    color: theme.palette.border.main,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },

  selectText: {
    height: '3.25rem',
  },

  infoIcon: {
    margin: theme.spacing(1.75, 0, 0, 0.5),
  },

  formLabel: {
    color: theme.palette.text.hint,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },

  flex: {
    display: 'flex',
  },

  summaryHeader: {
    justifyContent: 'space-between',
    width: '100%',
  },

  configHeader: {
    fontSize: '1rem',
    lineHeight: '140%',
    paddingTop: theme.spacing(3.5),
  },

  paddedTop: {
    paddingTop: theme.spacing(2.5),
  },
}));

export default useStyles;
