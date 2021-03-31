import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  userName: {
    fontSize: '2.5rem',
    margin: theme.spacing(1.75, 0, 2.75, 0),
  },

  firstRow: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },

  mainDiv: {
    padding: theme.spacing(6.625, 5),
    borderRadius: 3,
    display: 'flex',
    flexGrow: 1,
  },

  paperContent: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },

  mainHeading: {
    color: theme.palette.primary.dark,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1.5),
  },

  mainResult: {
    color: theme.palette.text.primary,
    fontSize: '1.5625rem',
    maxWidth: '25rem',
    marginBottom: theme.spacing(3.125),
  },

  warningText: {
    color: theme.palette.warning.main,
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  mainDesc: {
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    maxWidth: '25rem',
    marginTop: theme.spacing(1.375),
  },

  imageDiv: {
    marginRight: theme.spacing(6.25),
  },

  workflowCard: {
    [theme.breakpoints.down('md')]: {
      maxWidth: '19.375rem',
      marginTop: theme.spacing(3.125),
    },
  },

  secondRow: {
    display: 'flex',
    marginTop: theme.spacing(3.125),
    '& #rowTwoSecondPaper': {
      margin: theme.spacing(0, 5.625, 0, 5.35),
      minWidth: '15.6875rem',
      [theme.breakpoints.down('md')]: {
        margin: theme.spacing(3.125, 0, 3.125, 0),
      },
    },
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },

  rowTwoPaper: {
    padding: theme.spacing(5),
    flexGrow: 1,
    maxWidth: '50%',
    '& #agentText': {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
    },
  },

  agentFlex: {
    display: 'flex',
    marginTop: theme.spacing(2.5),
    '& p:nth-child(2)': {
      fontWeight: 500,
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'flex-end',
      margin: theme.spacing(0, 0, 4, 2),
    },
  },

  agentCount: {
    fontWeight: 500,
    fontSize: '6.25rem',
    color: theme.palette.primary.light,
  },

  agentDesc: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(5),
    maxWidth: '16.25rem',
    color: theme.palette.text.hint,
  },

  flexEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  invitationBoxFlex: {
    borderRadius: '0.1875rem',
    border: `1px solid ${theme.palette.warning.main}`,
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    '& p': {
      fontSize: '1.25rem',
      color: theme.palette.warning.main,
      padding: theme.spacing(0, 0, 0, 1),
    },
  },

  projectInfoProjectStats: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
    '& p:first-child': {
      fontSize: '5.625rem',
      color: theme.palette.primary.light,
    },
    '& p:nth-child(2)': {
      display: 'flex',
      alignItems: 'flex-end',
      fontSize: '1.875rem',
      padding: theme.spacing(0, 0, 2.875, 2.5),
    },
  },

  predefinedBtn: {
    marginTop: theme.spacing(2.5),
  },

  quickActionCard: {
    marginRight: theme.spacing(3.125),
  },
}));

export default useStyles;
