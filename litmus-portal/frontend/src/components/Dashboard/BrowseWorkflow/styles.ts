import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid ',
    borderColor: theme.palette.text.hint,
    backgroundColor: theme.palette.common.white,
  },
  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
  },
  select: {
    width: '9.375rem',
    marginLeft: theme.spacing(1.25),
    paddingBottom: theme.spacing(2.5),
  },
  select1: {
    width: '10.375rem',
    marginLeft: theme.spacing(1.25),
    paddingBottom: theme.spacing(2.5),
  },
  headerText: {
    marginLeft: theme.spacing(3.75),
    color: theme.palette.text.disabled,
    paddingBottom: theme.spacing(0.625),
  },
  tableMain: {
    marginTop: theme.spacing(6.25),
    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.common.white,
  },
  tableHead: {
    opacity: 0.5,
  },
  headerStatus: {
    paddingLeft: theme.spacing(10),
  },
  headerStatus1: {
    paddingLeft: theme.spacing(8),
  },
  progressBar: {
    width: '6.5rem',
  },
  steps: {
    marginLeft: theme.spacing(5.625),
  },
  menuItem: {
    paddingLeft: theme.spacing(1.75),
  },
  workflowName: {
    borderRight: '1px solid rgba(0,0,0,0.1)',
  },
  targetCluster: {
    paddingLeft: theme.spacing(3.75),
  },
  clusterName: {
    marginLeft: theme.spacing(3.75),
  },
  reliabiltyData: {
    width: '8.125rem',
  },
  stepsData: {
    paddingLeft: theme.spacing(3.75),
  },
  timeData: {
    paddingTop: theme.spacing(1.25),
  },
  optionBtn: {
    marginLeft: 'auto',
  },
}));

export default useStyles;
