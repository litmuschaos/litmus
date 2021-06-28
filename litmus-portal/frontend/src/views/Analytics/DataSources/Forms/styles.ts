import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100%',
    width: '100%',
    border: '1px',
    borderRadius: '3px',
    boxShadow:
      '0 0.3px 0.9px rgba(0, 0, 0, 0.1), 0 1.6px 3.6px rgba(0, 0, 0, 0.13)',
    padding: theme.spacing(4, 3.125, 6),
  },

  flexDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
  },

  heading: {
    fontSize: '1.125rem',
    margin: theme.spacing(0, 0, 1, 2),
    fontWeight: 500,
    lineHeight: '1.375rem',
    letterSpacing: '0.1142px',
  },

  subHeading: {
    fontSize: '0.875rem',
    lineHeight: '150%',
    color: theme.palette.text.hint,
    margin: theme.spacing(0, 0, 2, 2),
  },

  horizontalLine: {
    margin: theme.spacing(6, 0),
  },

  inputDiv: {
    margin: theme.spacing(2, 0, 1),
    paddingLeft: theme.spacing(2),
  },

  inputDivRadioButton: {
    margin: theme.spacing(1, 0, 0, 3.5),
    width: '100%',
  },

  basicAuth: {
    marginLeft: theme.spacing(8),
  },

  withCredentials: {
    marginLeft: theme.spacing(4),
  },

  withCACert: {
    marginLeft: theme.spacing(2),
  },

  inlineIcon: {
    margin: theme.spacing(0.25, 0),
    width: '1.25rem',
    height: '1.25rem',
  },

  button: {
    minWidth: 0,
    minHeight: 0,
    padding: 0,
    margin: theme.spacing(1.5, 0, 0, 2),
    '&:hover': {
      cursor: 'pointer !important',
    },
  },

  buttonLabel: {
    justifyContent: 'flex-start',
    marginLeft: theme.spacing(0.5),
  },

  infoValue: {
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.1176px',
    color: theme.palette.highlight,
  },
}));

export default useStyles;
