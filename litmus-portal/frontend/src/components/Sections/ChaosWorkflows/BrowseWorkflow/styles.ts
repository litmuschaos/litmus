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
    marginRight: theme.spacing(2.5),
    height: '2.5rem',
    minWidth: '9rem',
  },

  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  selectDate: {
    display: 'flex',
    flexDirection: 'row',
    height: '2.5rem',
    minWidth: '9rem',
    border: '1.7px solid',
    borderRadius: 4,
    borderColor: theme.palette.secondary.main,
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
  },
  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
  },

  // Table and Table Data Properties
  tableMain: {
    marginTop: theme.spacing(6.25),
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    backgroundColor: theme.palette.common.white,
    height: '29.219rem',
  },
  tableHead: {
    opacity: 1,
  },
  headerStatus: {
    paddingLeft: theme.spacing(10),
    color: theme.palette.customColors.black(0.4),
  },
  workflowName: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
    color: theme.palette.customColors.black(0.4),
  },
  sortDiv: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1.25),
  },
  headData: {
    color: theme.palette.customColors.black(0.4),
  },
  tableDataStatus: {
    paddingLeft: theme.spacing(8.5),
  },
  progressBar: {
    width: '6.5rem',
  },
  steps: {
    marginLeft: theme.spacing(5.625),
  },
  workflowNameData: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
  },
  targetCluster: {
    paddingLeft: theme.spacing(3.75),
    color: theme.palette.customColors.black(0.4),
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
  optionBtn: {
    marginLeft: 'auto',
  },
  timeDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  failed: {
    color: theme.palette.error.main,
  },
  success: {
    color: theme.palette.primary.dark,
  },
}));

export default useStyles;
