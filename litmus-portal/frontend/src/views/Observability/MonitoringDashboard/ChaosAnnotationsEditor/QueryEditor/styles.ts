import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2, 5, 0, 0),
  },

  query: {
    flexDirection: 'row-reverse',
    paddingLeft: 0,
  },

  queryContainer: {
    position: 'relative',
    width: '100%',
    background: theme.palette.background.paper,
    padding: theme.spacing(2, 0, 1, 3.5),
  },

  queryTitle: {
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.1714px',
    fontWeight: 500,
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

  legend: {
    width: '100%',
    marginTop: theme.spacing(2.75),
  },

  paddedTop: {
    paddingTop: theme.spacing(2.5),
  },
}));

export default useStyles;
