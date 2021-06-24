import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  accordionSummary: {
    display: 'flex',
    justifyItems: 'center',
    background: theme.palette.cards.header,
    borderRadius: '3px 3px 0px 0px',
  },

  accordionDetails: {
    width: '100%',
  },

  button: {
    background: 'none',
    boxShadow: 'none',
    padding: 0,
    '&:hover': {
      background: 'none',
      boxShadow: 'none',
      cursor: 'pointer !important',
    },
  },

  chaosHelperText: {
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.primary.main,
  },

  tableDropIcon: {
    width: '1.75rem',
    height: '1.75rem',
    color: theme.palette.primary.main,
  },

  editIconButton: {
    marginTop: theme.spacing(-0.75),
  },
}));

export default useStyles;
