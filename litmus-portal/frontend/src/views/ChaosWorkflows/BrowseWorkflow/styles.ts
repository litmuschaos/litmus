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
    backgroundColor: theme.palette.homePageCardBackgroundColor,
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
    border: '0.125rem solid',
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
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  tableMain: {
    marginTop: theme.spacing(4.25),
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    backgroundColor: theme.palette.homePageCardBackgroundColor,
    height: '29.219rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  tableHead: {
    '& p': {
      fontWeight: 'bold',
      fontSize: '0.8125rem',
    },
    '& th': {
      fontWeight: 'bold',
      fontSize: '0.8125rem',
      backgroundColor: theme.palette.homePageCardBackgroundColor,
    },
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
    maxWidth: '15.625rem',
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
  },
  targetCluster: {
    paddingLeft: theme.spacing(3.75),
    color: theme.palette.customColors.black(0.4),
  },
  clusterName: {
    marginLeft: theme.spacing(4),
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
  // Menu option with icon
  expDiv: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },
  btnImg: {
    width: '0.8125rem',
    height: '0.8125rem',
    marginTop: theme.spacing(0.375),
  },
  btnText: {
    paddingLeft: theme.spacing(1.625),
  },
  paddedTypography: {
    paddingTop: theme.spacing(1.5),
  },
}));

export default useStyles;
