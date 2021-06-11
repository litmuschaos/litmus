import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  headerDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3.5),
    paddingTop: theme.spacing(2.15),
    backgroundColor: theme.palette.cards.header,
    minHeight: '5rem',
  },

  selectDate: {
    display: 'flex',
    height: '2.9rem',
    minWidth: '9rem',
    marginLeft: theme.spacing(3.75),
    border: `0.1px solid ${theme.palette.border.main}`,
    background: theme.palette.background.paper,
    borderRadius: '0.25rem',
    textTransform: 'none',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.background.paper,
    },
    '&$focused': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.background.paper,
    },
  },

  displayDate: {
    width: '100%',
    color: theme.palette.text.primary,
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
    margin: theme.spacing(0, -1, 0, 1),
  },

  rangeSelectorClockIcon: {
    width: '0.825rem',
    height: '0.825rem',
    margin: theme.spacing(0, 1, 0, -1),
  },

  rangeSelectorPopover: {
    margin: theme.spacing(-2, 0, 0, -4.25),
  },

  menuListItem: {
    background: `${theme.palette.background.paper} !important`,
    fontSize: '0.875rem',
    lineHeight: '150%',
    height: '1.75rem',
    width: '11.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  },

  menuListItemText: {
    fontSize: '0.875rem',
  },

  checkIcon: {
    margin: theme.spacing(0, 1),
  },

  refreshDiv: {
    display: 'flex',
  },

  refreshButton: {
    padding: theme.spacing(1.6),
    minWidth: '2rem',
    background: theme.palette.background.paper,
    borderColor: theme.palette.border.main,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.background.paper,
    },
    marginLeft: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      width: 'fit-content',
      marginLeft: theme.spacing(3.75),
    },
  },

  refreshIcon: {
    width: '1.15rem',
    height: '1.15rem',
  },

  headerInfoText: {
    fontWeight: 500,
    fontSize: '0.9rem',
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

  formControl: {
    width: '6rem',
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
}));

export const useOutlinedInputStyles = makeStyles((theme: Theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.primary.main,
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
  focused: {},
  notchedOutline: {},
}));

export default useStyles;
