import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1.5),
    overflowX: 'hidden',
  },
  mainHeader: {
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 1.5, 2.5, 0),
  },

  LitmusAnalyticsBlock: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  errorMessage: {
    marginTop: theme.spacing(35),
  },

  LitmusAnalyticsDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(0.4),
    paddingTop: theme.spacing(0.4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  header2: {
    fontSize: '1.5rem',
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },

  cardDiv: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  paper: {
    backgroundColor: '#FFF',
    color: theme.palette.text.primary,
    flexGrow: 1,
    marginRight: theme.spacing(2),
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
  },
  card: {
    backgroundColor: theme.palette.primary.main,
    color: '#FFFFFF',
    height: '21.25rem',
    textAlign: 'center',
    width: '20rem',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      width: '100%',
    },
  },

  cardContent: {
    marginTop: theme.spacing(4),
  },

  LitmusOnDev: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(2),
  },

  LitmusOnDevSpan: {
    bottom: theme.spacing(2),
    fontSize: '1.5rem',
    fontWeight: 'normal',
    left: theme.spacing(3),
    position: 'relative',
  },

  devToLogo: {
    fill: 'white',
    filter:
      'invert(98%) sepia(100%) saturate(0%) hue-rotate(86deg) brightness(118%) contrast(119%)',
    height: '3rem',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    width: '5rem',
  },
  imgDiv: {
    '& img': {
      userDrag: 'none',
    },
  },
  followBtn: {
    backgroundColor: theme.palette.secondary.contrastText,
    color: theme.palette.common.black,
    fontSize: '0.8rem',
    height: '3rem',
    textTransform: 'none',
    width: '10rem',
  },

  devToLink: {
    textDecoration: 'none',
  },

  LitmusUsedBlock: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
  },

  LitmusUsedDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(0.4),
    paddingTop: theme.spacing(0.4),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  quickActionCard: {
    height: '21.25rem',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(7),
    width: '15rem',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
      width: '15rem',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      marginTop: theme.spacing(5),
      width: '20rem',
    },
  },
}));

export default useStyles;
