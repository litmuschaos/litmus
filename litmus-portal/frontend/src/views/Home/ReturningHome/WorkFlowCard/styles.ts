import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  totWorkFlow: {
    width: '21.125rem',
    maxHeight: '12rem',
    padding: theme.spacing(3.25),
    display: 'flex',
    flexDirection: 'column',
  },
  workflowHeader: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  detailsDiv: {
    marginTop: theme.spacing(2),
    display: 'flex',
  },
  wfDiv: {
    display: 'flex',
    marginLeft: theme.spacing(2),
    flexDirection: 'column',
  },
  totWorkflow: {
    fontSize: '0.875rem',
    fontWeight: 500,
    margin: theme.spacing(3.125, 0, 0.875, 0),
  },
  wfText: {
    fontWeight: 400,
    fontSize: '0.75rem',
    color: theme.palette.text.hint,
  },
}));

export default useStyles;
