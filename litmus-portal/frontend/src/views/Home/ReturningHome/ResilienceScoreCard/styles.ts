import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  totWorkFlow: {
    width: '21.125rem',
    height: '12rem',
    padding: theme.spacing(3.25),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  workflowHeader: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  detailsDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexEnd: {
    display: 'flex',
    alignItems: 'center',
  },
  goToIcon: {
    padding: theme.spacing(0, 0, 0, 1),
  },
  radialGraph: {
    marginBottom: theme.spacing(2),
    '& p:nth-child(1)': {
      fontSize: '1.27rem',
    },
    '& p:nth-child(2)': {
      fontSize: '0.75rem',
    },
  },
}));

export default useStyles;
