import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  firstAgentContainer: {
    padding: theme.spacing(6.5, 11.875),
    display: 'flex',

    '& img': {
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    },

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  agentDeployDesc: {
    marginLeft: theme.spacing(12.5),

    '& p:first-child': {
      marginBottom: theme.spacing(3.5),
      fontSize: '1.5rem',
      fontWeight: 500,
    },

    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
  },
  buttonGroup: {
    marginTop: theme.spacing(5.25),
    display: 'flex',

    '& button': {
      marginRight: theme.spacing(5),
    },

    '& svg': {
      marginRight: theme.spacing(1.5),
    },

    '& button:nth-child(2)': {
      '& span': {
        color: theme.palette.highlight,
      },

      '& p': {
        fontWeight: 500,
        fontSize: '0.875rem',
      },
    },
  },
  projectInfoContainer: {
    marginTop: theme.spacing(3.25),
    padding: theme.spacing(3.125, 6.5),
    display: 'flex',
    alignItems: 'center',
  },
  projectInfoBlock: {
    flexGrow: 1,
  },
  projectInfoData: {
    display: 'flex',
    padding: theme.spacing(1),
    maxWidth: '20.5625rem',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& div': {
      display: 'flex',
      alignItems: 'baseline',

      '& p:first-child': {
        fontSize: '3.875rem',
      },

      '& #projectCount': {
        color: theme.palette.highlight,
      },

      '& #invitationCount': {
        color: theme.palette.primary.light,
      },

      '& p:last-child': {
        fontSize: '1.125rem',
        fontWeight: 500,
        marginLeft: theme.spacing(1),
      },
    },
  },
}));

export default useStyles;
