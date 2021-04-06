import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  totWorkFlow: {
    width: '21.125rem',
    maxHeight: '12rem',
    padding: theme.spacing(3.25),
    display: 'flex',
    flexDirection: 'column',
  },
  flexEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  goToIcon: {
    padding: theme.spacing(0, 0, 0, 1),
  },
  invitationBoxFlex: {
    borderRadius: '0.1875rem',
    border: `1px solid ${theme.palette.warning.main}`,
    padding: theme.spacing(0.75),
    display: 'flex',
    alignItems: 'center',
    '& p': {
      fontSize: '0.875rem',
      color: theme.palette.warning.main,
      padding: theme.spacing(0, 0, 0, 1),
    },
  },
  projectInfoProjectStats: {
    display: 'flex',
    '& p:first-child': {
      fontSize: '3.75rem',
      color: theme.palette.primary.light,
    },
    '& p:nth-child(2)': {
      display: 'flex',
      alignItems: 'flex-end',
      fontSize: '1.5rem',
      padding: theme.spacing(0, 0, 2.875, 2.5),
    },
  },
}));

export default useStyles;
