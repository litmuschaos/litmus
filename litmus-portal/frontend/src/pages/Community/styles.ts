import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  root: {
    overflowX: 'hidden',
  },
  mainHeader: {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2.5),
  },

  LitmusAnalyticsBlock: {
    margin: theme.spacing(2, 0),
  },
  errorMessage: {
    marginTop: theme.spacing(35),
  },

  LitmusAnalyticsDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(0.4),
    paddingBottom: theme.spacing(0.4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  header2: {
    fontSize: '1.5rem',
    fontWeight: 'normal',
    paddingTop: theme.spacing(2),
    textAlign: 'left',
    marginLeft: theme.spacing(4),
  },
  subHeading: {
    color: theme.palette.text.hint,
    fontSize: '1.125rem',
    fontWeight: 'normal',
    paddingBottom: theme.spacing(2),
    textAlign: 'left',
    marginLeft: theme.spacing(4),
  },

  cardDiv: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  paper: {
    flexGrow: 1,
    textAlign: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.text.secondary,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },

  card: {
    backgroundColor: theme.palette.primary.main,
    height: '21.25rem',
    width: '20rem',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      marginTop: theme.spacing(2),
      width: '100%',
      flexDirection: 'column',
    },
  },

  cardContent: {
    marginTop: theme.spacing(4),
  },

  LitmusOnDev: {
    marginTop: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },

  LitmusOnDevSpan: {
    position: 'relative',
    fontWeight: 'normal',
    fontSize: '1.5rem',
    bottom: theme.spacing(2),
    left: theme.spacing(3),
  },

  LitmusUsedBlock: {
    margin: theme.spacing(2, 0),
  },

  LitmusUsedDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(0.4),
    paddingBottom: theme.spacing(0.4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
}));

export default useStyles;
