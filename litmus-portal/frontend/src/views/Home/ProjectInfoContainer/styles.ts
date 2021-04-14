import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
  viewProjectButton: {
    '& img': {
      margin: theme.spacing(0, 1, -0.25, 0),
    },
    '& p': {
      fontWeight: 500,
    },
  },
}));

export default useStyles;
