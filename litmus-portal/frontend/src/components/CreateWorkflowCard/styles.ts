import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  cardAreaBody: {
    height: '100%',
  },

  createWorkflowHeading: {
    fontSize: '0.9375rem',
    position: 'absolute',
    marginLeft: theme.spacing(3.75),
    top: '10%',
  },

  createWorkflowTitle: {
    fontSize: 25,
    position: 'absolute',
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    marginLeft: theme.spacing(3.75),
    top: '30%',
  },
  arrowForwardIcon: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(22.5),
    position: 'absolute',
    bottom: '10%',
  },
}));

export default useStyles;
