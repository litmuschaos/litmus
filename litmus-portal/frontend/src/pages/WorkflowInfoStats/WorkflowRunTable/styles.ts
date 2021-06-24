import {
  createStyles,
  makeStyles,
  TableCell,
  Theme,
  withStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4.75)
  },

  analyticsDiv: {
    paddingRight: theme.spacing(3.75),
  },

  headerSection: {
    display: 'flex',
    alignItems: 'center',
    height: '6rem',
    // borderTop: `1px solid ${theme.palette.border.main}`,
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },

  tableMain: {
    marginTop: theme.spacing(-0.5),
    borderTop: `1px solid ${theme.palette.border.main}`,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.background.paper,
    minHeight: '25rem',
  },

  tableHead: {
    opacity: 0.7,
    color: theme.palette.text.primary,
  },

  testName: {
    borderRight: `1px solid ${theme.palette.border.main}`,
  },

  nameContent: {
    display: 'flex',
    alignItems: 'center',
  },

  testWeightPointHead: {
    marginTop: theme.spacing(0.5),
  },

  progressBar: {
    width: '6.5rem',
  },

  paginationArea: {
    width: '100%',
    display: 'flex',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    height: '4.5rem',
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(-0.175),
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  pagination: {
    marginTop: theme.spacing(1),
  },

  toolTipGroup: {
    display: 'flex',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },

  resultText: {
    fontSize: '1.125rem',
    color: theme.palette.text.primary,
    width: '20rem',
    marginTop: theme.spacing(3),
    verticalAlign: 'middle',
    display: 'inline-flex',
    marginLeft: theme.spacing(5),
  },

  reliabilityScore: {
    fontSize: '2.25rem',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-20),
  },

  reliabilityDataTypography: {
    fontWeight: 500,
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
  },

  selectDate: {
    display: 'flex',
    height: '2.5rem',
    minWidth: '9rem',
    border: `0.1px solid ${theme.palette.border.main}`,
    borderRadius: 4,
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    height: '2.5rem',
    minWidth: '9rem',
  },

  testResultForm: {
    marginRight: theme.spacing(3),
  },

  testForm: {
    marginRight: theme.spacing(4),
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  dateRangeDefault: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
  },
}));

export const useOutlinedInputStyles = makeStyles((theme: Theme) => ({
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
    height: '2.5rem',
  },
  focused: {},
  notchedOutline: {},
}));

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);

export default useStyles;
