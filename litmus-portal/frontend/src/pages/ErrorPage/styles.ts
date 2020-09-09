import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainHeader: {
    height: '103%',
    backgroundImage: `url(${'/icons/error-background.svg'})`,
    backgroundSize: 'cover',
    marginLeft: theme.spacing(-5),
    marginRight: theme.spacing(-5),
    marginTop: theme.spacing(-2),
    marginBottom: theme.spacing(-15),
    [theme.breakpoints.up('xs')]: {
      height: '110%',
      marginBottom: theme.spacing(-12),
    },
    [theme.breakpoints.up('sm')]: {
      height: '106.25%',
      marginBottom: theme.spacing(-17),
    },
    [theme.breakpoints.up('md')]: {
      height: '105.25%',
      marginBottom: theme.spacing(-17),
    },
    [theme.breakpoints.up('lg')]: {
      height: '104.75%',
      marginBottom: theme.spacing(-17),
    },
    [theme.breakpoints.up('xl')]: {
      height: '104.25%',
      marginBottom: theme.spacing(-17),
    },
  },
  root: {
    height: '100%',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '10%',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    [theme.breakpoints.up('lg')]: {
      marginTop: '5%',
    },
  },
  headerDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    height: '16.25rem',
    marginLeft: '12%',
    justifyContent: 'space-between',
    marginTop: theme.spacing(12.5),
    flexGrow: 1,
    [theme.breakpoints.up('xl')]: {
      marginTop: '7%',
      marginLeft: '20%',
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(8.75),
      marginLeft: '14%',
      height: '12.5rem',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      marginLeft: '5%',
      marginRight: '5%',
      marginTop: '5%',
      textAlign: 'center',
      alignItems: 'center',
      justifyItems: 'center',
    },
  },
  mainText: {
    fontSize: '3.125rem',
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.up('xl')]: {
      fontSize: '3.75rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.875rem',
    },
  },
  backBtn: {
    maxWidth: '7.375rem',
    height: '2.75rem',
    padding: theme.spacing(1.875),
    backgroundColor: theme.palette.secondary.dark,
    textTransform: 'none',
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    [theme.breakpoints.down('md')]: {
      marginTop: 10,
    },
  },
  descText: {
    fontSize: '1rem',
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.875rem',
      paddingTop: theme.spacing(2.5),
      paddingBottom: theme.spacing(2.5),
    },
  },
  errImg: {
    width: '26.25rem',
    height: '26.25rem',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: '100%',
    },
  },
  imgDiv: {
    width: '50%',
    marginTop: '5%',
    marginLeft: '5%',
    marginRight: 'auto',
    [theme.breakpoints.down('xs')]: {
      width: '80%',
      marginTop: theme.spacing(1.25),
      marginRight: 0,
      marginLeft: theme.spacing(0.75),
    },
    [theme.breakpoints.down(380)]: {
      width: '80%',
      marginTop: theme.spacing(10),
    },
  },
}));

export default useStyles;
