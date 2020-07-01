import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    flexGrow: 1,
    display: 'flex',
    fontFamily: 'Ubuntu',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainHeader: {
    color: theme.palette.text.primary,
    fontSize: '2rem',
    marginBottom: theme.spacing(6),
  },
  LitmusAnalyticsBlock: {
    margin: '2em 0',
  },
  header2: {
    fontSize: '1.5rem',
    padding: '1rem 0',
  },
  cardDiv: {
    display: 'flex',
    flexDirection: 'row',
    padding: '3em 0',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(8),
    },
  },
  paper: {
    padding: theme.spacing(20),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  card: {
    backgroundColor: theme.palette.secondary.dark,
    height: '28em',
    textAlign: 'center',
    color: 'white',
  },
  cardContent: {
    marginTop: theme.spacing(4),
  },
  LitmusOnDev: {
    marginTop: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: '3em',
  },
  LitmusOnDevSpan: {
    fontSize: '0.7em',
    fontWeight: 'normal',
  },
  LitmusOnDevOnSpan: {
    position: 'relative',
    fontWeight: 'bold',
    bottom: theme.spacing(2),
  },
  devToLogo: {
    fill: 'white',
    filter:
      'invert(98%) sepia(100%) saturate(0%) hue-rotate(86deg) brightness(118%) contrast(119%)',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    width: '2em',
    height: '2em',
  },
  followBtn: {
    width: '13em',
    height: '4em',
    backgroundColor: '#FFFFFF',
    fontSize: '1em',
    color: theme.palette.text.primary,
    textTransform: 'none',
  },
  LitmusUsedBlock: {
    margin: '3em 0',
  },
}));

export default useStyles;
