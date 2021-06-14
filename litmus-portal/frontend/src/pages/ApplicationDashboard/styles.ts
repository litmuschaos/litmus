import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflowX: 'hidden',
  },

  root: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2.5),
  },

  controlsDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4.5),
  },

  italic: {
    fontStyle: 'italic',
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

  weightedFont: {
    fontWeight: 500,
  },

  // Menu option
  menuItem: {
    minWidth: '10rem',
    height: '2.5rem',
  },

  menuItemSelected: {
    background: theme.palette.primary.light,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      background: theme.palette.primary.light,
    },
    minWidth: '10rem',
    height: '2.5rem',
  },

  expDiv: {
    display: 'flex',
  },

  btnText: {
    fontWeight: 500,
  },

  formControl: {
    width: '9rem',
    marginLeft: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3.75),
    },
    '& .MuiSelect-outlined': {
      padding: '0.925rem',
      '&:focus': {
        borderColor: theme.palette.primary.main,
      },
      '& .MuiInputLabel-root': {
        color: `${theme.palette.text.hint} !important`,
        marginTop: `${theme.spacing(2)} !important`,
      },
    },
  },

  inputLabel: {
    color: theme.palette.text.hint,
    marginTop: theme.spacing(-1),
    '&.MuiInputLabel-shrink': {
      marginTop: theme.spacing(1),
    },
  },

  menuListItem: {
    color: theme.palette.text.hint,
    height: '2.4rem',
  },

  menuListItemSelected: {
    height: '2.4rem',
    background: `${theme.palette.primary.light} !important`,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      background: `${theme.palette.primary.light} !important`,
    },
  },

  chaosTableSection: {
    padding: theme.spacing(2.5, 2, 0),
  },
}));

export default useStyles;
