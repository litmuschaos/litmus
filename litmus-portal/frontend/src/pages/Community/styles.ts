import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1, 1.5, 1.5),
    overflowX: 'hidden',
  },
  mainHeader: {
    color: theme.palette.text.primary,
    margin: theme.spacing(0, 1.5, 2.5, 0),
  },

  LitmusAnalyticsBlock: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
    paddingBottom: theme.spacing(1),
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
    marginRight: theme.spacing(2),
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
    color: '#FFFFFF',
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
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
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
