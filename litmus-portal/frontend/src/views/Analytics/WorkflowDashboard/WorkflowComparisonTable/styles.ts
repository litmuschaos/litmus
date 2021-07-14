import {
  createStyles,
  makeStyles,
  TableCell,
  withStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    overflow: 'hidden',
  },

  analyticsDiv: {
    paddingRight: theme.spacing(3.75),
  },

  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.primary,
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
    },
  },

  heading: {
    fontFamily: 'Ubuntu',
    fontSize: '1.5rem',
    color: theme.palette.text.primary,
  },

  description: {
    width: '50rem',
    marginTop: theme.spacing(3),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.text.primary,
  },

  tableFix: {
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(-1),
    width: '100%',
  },

  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '5.55rem',
    backgroundColor: theme.palette.background.paper,
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },

  calIcon: {
    color: theme.palette.text.hint,
    marginLeft: theme.spacing(3.5),
  },

  formSize: {
    height: '2.75rem',
    padding: theme.spacing(0.5),
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    backgroundColor: theme.palette.background.paper,
    minHeight: '30.15rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tableMainCompare: {
    marginTop: theme.spacing(-0.25),
    borderTop: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.background.paper,
    height: '15rem',
    overflow: 'hidden',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tableBody: {
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto',
  },
  tableMainShowAll: {
    marginTop: theme.spacing(4.25),
    backgroundColor: theme.palette.background.paper,
    maxHeight: '30.15rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  pagination: {
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  seeAllPaper: {
    height: '5rem',
    backgroundColor: theme.palette.disabledBackground,
    paddingTop: theme.spacing(3.75),
    paddingBottom: theme.spacing(3.75),
    paddingLeft: '42%',
  },

  tableHead: {
    color: theme.palette.text.primary,
  },

  workflowName: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    paddingTop: theme.spacing(2.5),
    maxWidth: '16.5rem',
    color: theme.palette.text.primary,
  },

  workflowNameHead: {
    marginTop: theme.spacing(2),
  },

  tableObjects: {
    paddingLeft: theme.spacing(3.75),
    color: theme.palette.text.primary,
  },

  headSpacing: {
    paddingLeft: theme.spacing(6),
  },

  nameContent: {
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'row',
    fontSize: '0.8rem',
  },

  nameContentIcons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  dateRangeDefault: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
  },

  checkbox: {
    paddingLeft: theme.spacing(3.75),
    paddingTop: theme.spacing(0.5),
  },

  buttonBack: {
    alignContent: 'left',
    transform: 'rotate(-270deg)',
    height: '3.125rem',
    width: '3.125rem',
  },

  buttonBackStyle: {
    height: '4.375rem',
    width: '4.375rem',
  },

  markStyleCorrect: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.secondary.main,
  },

  markerIconDown: {
    color: theme.palette.text.primary,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  markerIconUp: {
    color: theme.palette.text.primary,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  seeAllText: {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },

  backgroundFix: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    height: '46rem',
    marginBottom: theme.spacing(-3),
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  comparisonHeadingFix: {
    marginLeft: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
  },

  buttonSeeAnalytics: {
    alignContent: 'left',
    transform: 'rotate(-90deg)',
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    marginRight: theme.spacing(1.5),
    minWidth: '9rem',
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  selectDate: {
    display: 'flex',
    height: '2.8rem',
    minWidth: '9rem',
    border: `0.1px solid ${theme.palette.border.main}`,
    borderRadius: 4,
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
  },

  headerDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3),
  },

  rootContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },

  export: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    textAlign: 'center',
    borderRadius: 3,
    paddingBottom: theme.spacing(1),
  },

  noData: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    height: '25rem',
    marginBottom: theme.spacing(-2),
    paddingTop: theme.spacing(22.5),
  },

  exportIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    display: 'block',
    backgroundColor: theme.palette.background.paper,
    width: '1.5rem',
    height: '1.5rem',
  },

  regularityData: {
    maxWidth: '17rem',
    marginLeft: theme.spacing(1.5),
  },

  iconDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(3),
  },

  paddedText: {
    paddingLeft: theme.spacing(1.25),
    color: theme.palette.text.primary,
  },

  error: {
    fontColor: theme.palette.text.primary,
    color: theme.palette.text.primary,
  },

  featureButtons: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },

  tableRowSelected: {
    backgroundColor: `${theme.palette.background.paper} !important`,
  },
}));

export const useOutlinedInputStyles = makeStyles((theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&$focused $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    height: '2.8rem',
  },
  focused: {},
  notchedOutline: {},
}));

export const StyledTableCell = withStyles((theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);

export default useStyles;
