import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  root: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(6),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.customColors.white(1),
  },
  mainDiv: {
    marginLeft: theme.spacing(3.75),
    width: '50rem',
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      width: '20rem',
    },
  },

  userName: {
    fontSize: '2.5rem',
    marginBottom: theme.spacing(3.75),
  },

  createWorkflowCard: {
    width: '14.375rem',
    border: '1px solid ',
    borderColor: theme.palette.secondary.dark,
    borderRadius: 3,
    marginLeft: theme.spacing(5),
    boxShadow: '2px 1px 9px rgba(91, 68, 186, 0.25)',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(5),
    },
  },

  createWorkflowHeading: {
    fontSize: '0.9375rem',
    marginLeft: theme.spacing(3.75),
    paddingTop: theme.spacing(5),
  },

  createWorkflowTitle: {
    fontSize: 25,
    color: theme.palette.secondary.dark,
    fontWeight: 'bold',
    marginLeft: theme.spacing(3.75),
    marginTop: theme.spacing(2.5),
  },

  headingDiv: {
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  arrowForwardIcon: {
    color: theme.palette.secondary.dark,
    marginLeft: theme.spacing(22.5),
    marginTop: theme.spacing(4.375),
    marginBottom: theme.spacing(2.5),
  },

  mainHeading: {
    color: theme.palette.primary.dark,
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(0.625),
  },

  mainResult: {
    color: theme.palette.common.black,
    fontSize: '1.5625rem',
    maxWidth: '27.5rem',
    marginBottom: theme.spacing(3.125),
  },

  mainDesc: {
    color: theme.palette.common.black,
    fontSize: '1.125rem',
    maxWidth: '36rem',
  },

  imageDiv: {
    marginLeft: theme.spacing(10),
    marginTop: theme.spacing(10),
  },

  contentDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  statDiv: {
    width: '50rem',
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
    [theme.breakpoints.down('sm')]: {
      width: '18rem',
    },
  },

  statsHeading: {
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(3.75),
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(5),
  },

  quickActionDiv: {
    marginTop: theme.spacing(2),
    borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(3),
  },

  cardDiv: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    paddingLeft: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },

  predefinedBtn: {
    height: '2.8125rem',
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    textTransform: 'none',
    marginTop: theme.spacing(3.75),
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  btnHeaderDiv: {
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  seeAllBtn: {
    width: '7.5rem',
    height: theme.spacing(5),
    marginTop: theme.spacing(5),
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(0.2),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(3.8),
    },
  },

  btnSpan: {
    display: 'flex',
    flexDirection: 'row',
  },

  btnText: {
    paddingRight: theme.spacing(1.25),
    textDecoration: 'none',
    color: theme.palette.secondary.dark,
  },
}));

export default useStyles;
