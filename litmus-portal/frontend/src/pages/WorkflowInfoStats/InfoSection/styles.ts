import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  sectionHeading: {
    fontSize: '1.5rem',
    fontWeight: 500,
    flexGrow: 1,
  },
  infoStatsHeader: {
    padding: theme.spacing(3.5),
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  infoStatsSection: {
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(2.5, 3.25),
    // marginBottom: theme.spacing(5.125),
  },
  infoStats: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3, 3.875),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '& div': {
      padding: theme.spacing(1),
    },
  },
  // Regularity info stat section fix for smaller screens
  regularity: {
    width: '20rem',
  },
  infoHeader: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  infoHint: {
    color: theme.palette.text.hint,
  },
  button: {
    backgroundColor: '#E5E7F1',
    width: '100%',
    border: 'none',
  },
  icon: {
    marginRight: theme.spacing(0.875),
  },
}));

export default useStyles;
