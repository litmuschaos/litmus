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
    border: '1px solid rgba(0, 0, 0, 0.05)',
    backgroundColor: theme.palette.cards.background,
  },
  search: {
    fontSize: '0.875rem',
    marginRight: 'auto',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    marginLeft: theme.spacing(6.25),
  },
  root: {
    backgroundColor: theme.palette.background.paper,
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
    marginTop: theme.spacing(4.25),
    border: `1px solid ${theme.palette.disabledBackground}`,
    backgroundColor: theme.palette.cards.background,
    height: '29.220rem',
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
    height: '4.6875rem',
    '& p': {
      fontSize: '0.8125rem',
      fontWeight: 'bold',
    },
    '& th': {
      backgroundColor: theme.palette.cards.background,
    },
  },
  headerStatus: {
    paddingLeft: theme.spacing(10),
    color: theme.palette.text.disabled,
  },
  headerStatus1: {
    paddingLeft: theme.spacing(8),
  },
  steps: {
    marginLeft: theme.spacing(5.625),
  },
  menuItem: {
    paddingLeft: theme.spacing(1.75),
  },
  workflowName: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
    color: theme.palette.text.disabled,
  },
  sortDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(1.25),
  },
  workflowNameData: {
    maxWidth: '15.625rem',
    paddingLeft: theme.spacing(6.25),
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  regularity: {
    color: theme.palette.text.disabled,
  },
  targetCluster: {
    color: theme.palette.text.disabled,
  },
  clusterStartDate: {
    paddingLeft: theme.spacing(10),
  },
  regularityData: {
    maxWidth: '16rem',
    paddingLeft: theme.spacing(0.2),
  },
  stepsData: {
    paddingLeft: theme.spacing(3.75),
  },
  expInfo: {
    fontWeight: 400,
    fontSize: 13,
  },
  expInfoActive: {
    color: theme.palette.primary.dark,
    fontWeight: 400,
    fontSize: 13,
  },
  expInfoActiveIcon: {
    color: theme.palette.primary.dark,
  },
  showExp: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.text.disabled,
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

  // Menu option with icon
  expDiv: {
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
  downloadText: {
    paddingLeft: theme.spacing(1.2),
  },
  downloadBtn: {
    marginTop: theme.spacing(0.375),
    marginLeft: theme.spacing(-0.375),
    width: '1.2rem',
    height: '1.2rem',
  },
  rerunBtn: {
    marginTop: theme.spacing(0.1),
    marginLeft: theme.spacing(-0.375),
    width: '1.2rem',
    height: '1.2rem',
  },
  // Experiment Weights PopOver Property
  weightDiv: {
    width: '15.1875rem',
    padding: theme.spacing(3.125, 2.6),
  },
  dark: {
    color: theme.palette.text.disabled,
  },
  weightInfo: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(0.625),
  },
  points: {
    marginLeft: 'auto',
    color: (props) =>
      props >= 3 && props <= 6
        ? theme.palette.warning.main
        : props >= 7
        ? theme.palette.success.main
        : theme.palette.error.main,
    fontWeight: 500,
  },

  // Modal
  modalDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5),
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(15),
    },
  },
  modalHeader: {
    fontSize: '2.125rem',
    fontWeight: 400,
    marginBottom: theme.spacing(2),
    width: '31.25rem',
  },
  modalConfirm: {
    fontSize: '1.25rem',
    marginBottom: theme.spacing(5),
    width: '31.25rem',
  },
  modalBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '16rem',
  },
  w7: { width: '7rem' },
}));

export default useStyles;
