import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflowX: 'hidden',
    msOverflowX: 'hidden',
  },

  root: {
    overflowY: 'hidden',
    msOverflowY: 'hidden',
    msOverflowStyle: 'none' /* Internet Explorer 10+ */,
    scrollbarWidth: 'none' /* Firefox */,
    '&::-webkit-scrollbar': {
      display: 'none' /* Safari and Chrome */,
    },
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2.5),
  },

  center: {
    padding: '25%',
  },

  loading: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    color: theme.palette.text.hint,
    fontSize: '1.25rem',
  },

  error: {
    textAlign: 'center',
    color: theme.palette.error.main,
    fontSize: '1rem',
  },

  flexButtons: {
    display: 'flex',
    justifyContent: 'center',
  },

  flexButton: {
    margin: theme.spacing(3, 2, 0),
  },

  controlsDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4.5),
  },

  analyticsDiv: {
    padding: theme.spacing(1, 0, 2),
    backgroundColor: theme.palette.background.paper,
    minHeight: '26rem',
  },

  button: {
    marginLeft: theme.spacing(-2),
  },

  iconButton: {
    height: '3rem',
    width: '3rem',
    marginLeft: theme.spacing(1.5),
  },

  dashboardSwitchIcon: {
    height: '2rem',
    width: '2rem',
    color: theme.palette.text.primary,
  },

  // Menu
  menuList: {
    boxShadow: '0 5px 9px rgba(0, 0, 0, 0.1)',
  },
  menuItem: {
    minWidth: '10rem',
    height: '2.5rem',
    background: `${theme.palette.background.paper} !important`,
    '&:hover': {
      background: `${theme.palette.cards.highlight} !important`,
    },
    '&.Mui-selected': {
      background: `${theme.palette.cards.highlight} !important`,
    },
  },

  btnText: {
    fontWeight: 500,
    fontStyle: 'italic',
  },

  chaosTableSection: {
    padding: theme.spacing(2.5, 2, 0),
  },
}));

export default useStyles;
