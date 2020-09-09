import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Header Section Properties
  headerSection: {
    width: '100%',
    height: '5.625rem',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid ',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.common.white,
  },
  search: {
    fontSize: 14,
    marginRight: 'auto',
    borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
    marginLeft: theme.spacing(6.25),
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    marginRight: theme.spacing(6.25),
    height: '2.5rem',
    minWidth: '9rem',
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  // Table and Table Data Properties
  headerText: {
    marginLeft: theme.spacing(3.75),
    color: theme.palette.text.disabled,
    paddingBottom: theme.spacing(0.625),
  },
  tableMain: {
    marginTop: theme.spacing(6.25),
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    backgroundColor: theme.palette.common.white,
    height: '29.220rem',
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
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
    color: theme.palette.customColors.black(0.4),
  },
  sortDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(1.25),
  },
  workflowNameData: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
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

  // Experiment Weights PopOver Property
  weightDiv: {
    width: '15.1875rem',
    padding: theme.spacing(3.125, 2.6),
  },
  weightInfo: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(0.625),
  },
  expDiv: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },
}));

export default useStyles;
