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
    width: '10.375rem',
    marginLeft: theme.spacing(1.25),
    paddingBottom: theme.spacing(2.5),
    marginRight: theme.spacing(3.75),
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
    height: '29.180rem',
  },
  tableHead: {
    opacity: 1,
    height: '4.6875rem',
  },
  headerStatus: {
    paddingLeft: theme.spacing(10),
    color: theme.palette.customColors.black(0.4),
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
    color: theme.palette.customColors.black(0.4),
  },
  workflowNameData: {
    borderRight: '1px solid rgba(0,0,0,0.1)',
  },
  regularity: {
    paddingLeft: theme.spacing(3.75),
    color: theme.palette.customColors.black(0.4),
  },
  targetCluster: {
    color: theme.palette.customColors.black(0.4),
  },
  clusterStartDate: {
    paddingLeft: theme.spacing(8),
  },
  regularityData: {
    maxWidth: '12.5rem',
    paddingLeft: theme.spacing(4),
  },
  stepsData: {
    paddingLeft: theme.spacing(3.75),
  },
  expInfo: {
    color: theme.palette.primary.dark,
  },
  showExp: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.customColors.black(0.4),
  },
  expDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  expDiv1: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },
  weightDiv: {
    width: 243,
    padding: '25px 20px',
  },
  weightInfo: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(0.625),
  },
  clusterData: {
    paddingTop: theme.spacing(1.25),
  },
  optionBtn: {
    marginLeft: theme.spacing(-6.25),
  },
  menuCell: {
    width: '3.125rem',
  },
  timeDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  btnImg: {
    width: '0.8125rem',
    height: '0.8125rem',
    marginTop: theme.spacing(0.375),
  },
  btnText: {
    paddingLeft: theme.spacing(1.625),
  },
}));

export default useStyles;
