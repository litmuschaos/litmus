import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },

  // Header Section Properties
  headerSection: {
    width: '100%',
    height: '5.625rem',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    backgroundColor: theme.palette.cards.background,
  },

  search: {
    fontSize: 14,
    marginRight: 'auto',
    borderBottom: `1px solid ${theme.palette.border.main}`,
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
    borderColor: theme.palette.primary.main,
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
  },
  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
  },

  // Table and Table Data Properties
  tableMain: {
    marginTop: theme.spacing(4.25),
    border: `1px solid ${theme.palette.disabledBackground}`,
    backgroundColor: theme.palette.cards.background,
    height: '29.219rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
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
      color: theme.palette.text.disabled,
      backgroundColor: theme.palette.cards.background,
    },
  },
  headerStatus: {
    paddingLeft: theme.spacing(4),
  },

  workflowName: {
    borderRight: `1px solid ${theme.palette.border.main}`,
  },

  targetCluster: {
    paddingLeft: theme.spacing(5),
  },

  sortDiv: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1.25),
  },

  workflowNameData: {
    maxWidth: '15.625rem',
    borderRight: `1px solid ${theme.palette.border.main}`,
  },

  clusterName: {
    marginLeft: theme.spacing(5),
  },
  reliabiltyData: {
    width: '12rem',
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  timeDiv: {
    display: 'flex',
    flexDirection: 'row',
  },

  // Colors for Resilency score and Experiments passed
  less: {
    color: theme.palette.status.workflow.failed,
  },
  medium: {
    color: theme.palette.status.workflow.pending,
  },
  high: {
    color: theme.palette.status.workflow.completed,
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
    display: 'flex',
    flexDirection: 'row',
    margin: theme.spacing('auto', 0),
  },
  experimentDetails: {
    display: 'flex',
  },
  arrowMargin: {
    marginLeft: theme.spacing(0.5),
  },
  popover: {
    padding: theme.spacing(3.125, 2.6),
    width: '15.1875rem',
  },

  boldText: {
    fontWeight: 'bold',
  },

  buttonTransform: {
    textTransform: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  LastUpdatedPopover: {
    pointerEvents: 'none',
  },
  lastUpdatedText: {
    '&:hover': {
      pointer: 'cursor',
    },
  },
  runningSmallIcon: {
    animation: 'runningNodeSpinAnimationSmall 2s ease-in-out infinite',
  },
  '@global': {
    '@keyframes runningNodeSpinAnimationSmall': {
      from: {
        transform: `rotate(0deg)`,
      },
      to: {
        transform: `rotate(360deg)`,
      },
    },
  },
  popoverWarning: {
    padding: theme.spacing(3.125, 2.6),
    width: 'fit-content',
  },
  runningText: {
    color: theme.palette.text.hint,
    marginLeft: theme.spacing(1),
  },

  // Warning pop-over styles
  warningTableCell: {
    maxWidth: '2.5rem',
  },
  imageRunning: {
    display: 'flex',
    marginTop: theme.spacing(1),
  },
  warningBtnDiv: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(2.5),
  },
  syncBtn: {
    backgroundColor: 'transparent !important',
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1.25),
  },
  waitingBtnText: {
    fontSize: '0.75rem',
    marginLeft: theme.spacing(0.625),
  },
  terminateText: {
    backgroundColor: 'transparent !important',
    color: theme.palette.primary.main,
  },
}));

export default useStyles;
