import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Header Section Properties
  rootLight: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5),
  },

  rootHeader: {
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(5),
  },

  resilliencyScore: {
    color: theme.palette.highlight,
    fontSize: '1.5rem',
  },

  headerFlex: {
    display: 'flex',
  },

  headerItemFlex: {
    width: '25%',
  },

  headerMiniItemFlex: {
    width: '50%',
  },

  headerMiniItemText: {
    color: theme.palette.text.disabled,
    fontSize: '1rem',
  },

  descTextBold: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },

  textBold: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },

  applicationDetails: {
    display: 'flex',
  },

  viewLogs: {
    marginLeft: theme.spacing(1),
    color: theme.palette.highlight,
  },

  arrowMargin: {
    marginLeft: theme.spacing(1),
  },
}));

export default useStyles;
