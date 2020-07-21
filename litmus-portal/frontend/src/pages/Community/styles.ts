import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  mainHeader: {
    color: theme.palette.text.primary,
    fontSize: '2.5rem',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(6),
  },

  LitmusAnalyticsBlock: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },

  cardDiv: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(8),
    },
  },

  paper: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: '#FFF',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },

  card: {
    backgroundColor: theme.palette.secondary.dark,
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

  devToLogo: {
    fill: 'white',
    filter:
      'invert(98%) sepia(100%) saturate(0%) hue-rotate(86deg) brightness(118%) contrast(119%)',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    width: '5rem',
    height: '3rem',
  },

  followBtn: {
    width: '10rem',
    height: '3rem',
    backgroundColor: '#FFFFFF',
    fontSize: '0.8rem',
    color: theme.palette.text.primary,
    textTransform: 'none',
  },

  devToLink: {
    textDecoration: 'none',
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

  quickActionCard: {
    height: '21.25rem',
    width: '20rem',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      width: '15rem',
      flexDirection: 'column',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      marginTop: theme.spacing(5),
      width: '25rem',
      flexDirection: 'column',
    },
  },
}));

export default useStyles;
