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
    height: 260,
    marginLeft: '12%',
    justifyContent: 'space-between',
    marginTop: 100,
    flexGrow: 1,
    [theme.breakpoints.up('xl')]: {
      marginTop: '7%',
      marginLeft: '20%',
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 70,
      marginLeft: '14%',
      height: 200,
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
    fontSize: '50px',
    color: '#000000',
    [theme.breakpoints.up('xl')]: {
      fontSize: '60px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '30px',
    },
  },
  backBtn: {
    width: 117,
    height: 44,
    padding: 15,
    backgroundColor: '#5B44BA',
    textTransform: 'none',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#5B44BA',
    },
    [theme.breakpoints.down('md')]: {
      marginTop: 10,
    },
  },
  descText: {
    fontSize: '16px',
    color: '#000000',
    paddingTop: 20,
    paddingBottom: 20,
    [theme.breakpoints.up('lg')]: {
      fontSize: '30px',
      paddingTop: 20,
      paddingBottom: 20,
    },
  },
  errImg: {
    width: 420,
    height: 420,
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
      marginTop: 10,
      marginRight: 0,
      marginLeft: 6,
    },
    [theme.breakpoints.down(380)]: {
      width: '80%',
      marginTop: 80,
    },
  },
}));

export default useStyles;
