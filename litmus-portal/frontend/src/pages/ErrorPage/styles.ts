import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainHeader: {
    backgroundImage: `url(${'/icons/error-background.svg'})`,
    backgroundSize: 'cover',
    height: '103%',
    marginBottom: theme.spacing(-15),
    marginLeft: theme.spacing(-5),
    marginRight: theme.spacing(-5),
    marginTop: theme.spacing(-2),
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
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginTop: '10%',
    },
    [theme.breakpoints.down('xs')]: {
      alignItems: 'center',
      flexDirection: 'column',
    },
    [theme.breakpoints.up('lg')]: {
      marginTop: '5%',
    },
  },
  headerDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '16.25rem',
    justifyContent: 'space-between',
    marginLeft: '12%',
    marginTop: theme.spacing(12.5),
    width: '50%',
    [theme.breakpoints.up('xl')]: {
      marginLeft: '20%',
      marginTop: '7%',
    },
    [theme.breakpoints.down('sm')]: {
      height: '12.5rem',
      marginLeft: '14%',
      marginTop: theme.spacing(8.75),
    },
    [theme.breakpoints.down('xs')]: {
      alignItems: 'center',
      justifyItems: 'center',
      marginLeft: '5%',
      marginRight: '5%',
      marginTop: '5%',
      textAlign: 'center',
      width: '100%',
    },
  },
  mainText: {
    color: theme.palette.text.primary,
    fontSize: '3.125rem',
    [theme.breakpoints.up('xl')]: {
      fontSize: '3.75rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.875rem',
    },
  },
  backBtn: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    height: '2.75rem',
    maxWidth: '7.375rem',
    padding: theme.spacing(1.875),
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    [theme.breakpoints.down('md')]: {
      marginTop: 10,
    },
  },
  descText: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    paddingBottom: theme.spacing(2.5),
    paddingTop: theme.spacing(2.5),
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.875rem',
      paddingBottom: theme.spacing(2.5),
      paddingTop: theme.spacing(2.5),
    },
  },
  errImg: {
    height: '26.25rem',
    width: '26.25rem',
    [theme.breakpoints.down('sm')]: {
      height: '100%',
      width: '100%',
    },
    [theme.breakpoints.down('xs')]: {
      height: '100%',
      width: '100%',
    },
  },
  imgDiv: {
    marginLeft: '5%',
    marginRight: 'auto',
    marginTop: '5%',
    width: '50%',
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(0.75),
      marginRight: 0,
      marginTop: theme.spacing(1.25),
      width: '80%',
    },
    [theme.breakpoints.down(380)]: {
      marginTop: theme.spacing(10),
      width: '80%',
    },
  },
}));

export default useStyles;
