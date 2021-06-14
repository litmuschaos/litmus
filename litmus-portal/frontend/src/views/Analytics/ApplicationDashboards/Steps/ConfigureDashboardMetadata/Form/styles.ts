import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100%',
    width: '100%',
    border: 1,
    borderRadius: 3,
    padding: theme.spacing(0, 4),
  },

  flexDisplay: {
    height: '5rem',
    display: 'flex',
    gap: '1.5rem',
    marginLeft: theme.spacing(1),
  },

  heading: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '150%',
    marginLeft: theme.spacing(1),
  },

  // Form Select Properties
  formControl: {
    height: '3.25rem',
    width: '20rem',
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

  namespaceSelect: {
    width: '41.5rem',
    margin: theme.spacing(3.5, 1),
  },

  appSelectFlex: {
    display: 'flex',
    gap: '1.5rem',
    margin: theme.spacing(0, 1),
  },
}));

export default useStyles;
