import { fade, makeStyles, Theme } from '@material-ui/core/styles';

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

  infoDiv: {
    marginTop: theme.spacing(3.5),
  },

  headerDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3.5),
    paddingTop: theme.spacing(2.15),
    backgroundColor: theme.palette.disabledBackground,
    minHeight: '5rem',
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

  selectDate: {
    display: 'flex',
    height: '2.9rem',
    minWidth: '9rem',
    marginLeft: theme.spacing(3.75),
    border: `0.1px solid ${theme.palette.border.main}`,
    background: theme.palette.background.paper,
    borderRadius: 4,
    textTransform: 'none',
  },

  displayDate: {
    width: '100%',
    color: theme.palette.text.primary,
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(-1),
  },

  rangeSelectorClockIcon: {
    width: '0.825rem',
    height: '0.825rem',
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(1),
  },

  rangeSelectorPopover: {
    marginTop: theme.spacing(37.5),
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

  refreshIcon: {
    marginRight: theme.spacing(1),
  },

  refreshText: {
    marginTop: theme.spacing(-2.85),
    marginLeft: theme.spacing(3.5),
  },

  headerInfoText: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.02em',
    width: '35%',
    marginLeft: theme.spacing(2.5),
  },

  controls: {
    marginRight: theme.spacing(2.25),
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginRight: 0,
    },
  },

  chaosTableSection: {
    padding: theme.spacing(2.5, 2, 0),
  },
}));

export const useOutlinedInputStyles = makeStyles((theme: Theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0px 4px 5px -2px ${fade(
        theme.palette.highlight,
        0.2
      )},0px 7px 10px 1px ${fade(
        theme.palette.highlight,
        0.14
      )},0px 2px 16px 1px ${fade(theme.palette.highlight, 0.12)}`,
    },
    '&$focused $notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputLabel-root': {
      color: `${theme.palette.text.hint} !important`,
      marginTop: `${theme.spacing(2)} !important`,
    },
    color: theme.palette.text.hint,
    background: theme.palette.background.paper,
  },
}));

export default useStyles;
