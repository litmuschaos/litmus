import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  totWorkFlow: {
    width: '21.125rem',
    maxHeight: '12rem',
    padding: theme.spacing(3.25),
    display: 'flex',
    flexDirection: 'column',
  },
  agentFlex: {
    display: 'flex',
  },
  agentCountDiv: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  agentCount: {
    fontWeight: 500,
    fontSize: '4.56rem',
    color: theme.palette.primary.light,
  },
  agentText: {
    fontSize: '0.91rem',
    marginBottom: theme.spacing(3),
  },
  agentDesc: {
    marginLeft: theme.spacing(3.75),
    // maxWidth: '16.25rem',
    color: theme.palette.text.hint,
  },
  deployButton: {
    maxWidth: '10.125rem',
    fontSize: '0.75rem',
    fontWeight: 400,
    height: '2.25rem',
  },
}));

export default useStyles;
