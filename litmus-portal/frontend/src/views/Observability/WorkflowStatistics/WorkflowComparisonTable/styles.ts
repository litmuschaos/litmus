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
    // overflow: 'hidden',
  },

  statisticsDiv: {
    paddingRight: theme.spacing(3.75),
  },

  heading: {
    fontSize: '1.5rem',
    color: theme.palette.text.primary,
  },

  description: {
    width: '50rem',
    marginTop: theme.spacing(2),
    fontSize: '1rem',
    color: theme.palette.text.primary,
  },

  tableFix: {
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(-1),
    width: '100%',
    height: '100%',
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
    marginLeft: theme.spacing(6),
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
    height: '29.85rem',
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
    borderTop: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.background.paper,
    height: '17.5rem',
    overflow: 'hidden',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tablePagination: {
    marginTop: theme.spacing(-0.25),
    height: '3.5rem',
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
    display: 'flex',
    flexDirection: 'row',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '150%',
    color: theme.palette.text.hint,
  },

  nameContentIcons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  dateRangeDefault: {
    height: '2.8rem',
    textTransform: 'none',
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
    fontSize: '1rem',
    color: theme.palette.secondary.main,
  },

  markerIcon: {
    color: theme.palette.text.hint,
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
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  comparisonHeadingFix: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
  },

  buttonSeeStatistics: {
    alignContent: 'left',
    transform: 'rotate(-90deg)',
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
    height: '2.6rem',
    minWidth: '9rem',
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
  },

  selectDate: {
    display: 'flex',
    height: '2.75rem',
    minWidth: '9rem',
    border: `0.1px solid ${theme.palette.border.main}`,
    borderRadius: '0.25rem',
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(2),
    textTransform: 'none',
    '&:hover': {
      borderColor: theme.palette.highlight,
    },
  },

  selectDateFocused: {
    border: `2px solid ${theme.palette.highlight}`,
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
    alignItems: 'center',
    display: 'flex',
    borderRadius: 3,
  },

  noData: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    height: '40rem',
    marginBottom: theme.spacing(-2),
    paddingTop: theme.spacing(22.5),
  },

  exportIcon: {
    marginRight: theme.spacing(1),
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
    marginTop: theme.spacing(0.25),
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },

  tableRowSelected: {
    backgroundColor: `${theme.palette.background.paper} !important`,
  },

  // select
  menuList: {
    boxShadow: '0 5px 9px rgba(0, 0, 0, 0.1)',
  },
  menuListItem: {
    background: `${theme.palette.background.paper} !important`,
    fontSize: '0.875rem',
    lineHeight: '150%',
    height: '1.875rem',
    '&:hover': {
      background: `${theme.palette.cards.highlight} !important`,
    },
    '&.Mui-selected': {
      background: `${theme.palette.cards.highlight} !important`,
    },
  },
}));

export const useOutlinedInputStyles = makeStyles((theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.highlight,
    },
    '&$focused $notchedOutline': {
      borderColor: theme.palette.highlight,
    },
    height: '2.75rem',
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
