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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wfText: {
    fontWeight: 400,
    fontSize: '0.75rem',
    color: theme.palette.text.hint,
    marginTop: theme.spacing(2.25),
  },
  quickAction: {
    '& ul > div': {
      margin: theme.spacing(0.5, 0),
      '& p': {
        fontSize: '0.875rem',
      },
    },
  },
}));

export default useStyles;
