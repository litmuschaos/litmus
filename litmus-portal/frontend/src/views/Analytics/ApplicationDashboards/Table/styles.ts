import {
  createStyles,
  makeStyles,
  TableCell,
  Theme,
  withStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    marginTop: theme.spacing(3),
  },

  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '6rem',
    backgroundColor: theme.palette.background.paper,
  },

  headerIcon: {
    color: theme.palette.text.primary,
    opacity: 0.6,
  },

  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.primary,
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
    },
  },

  tableRow: {
    height: '4.5rem',
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    height: '29.75rem',
    backgroundColor: theme.palette.background.paper,
    minHeight: '25rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tableHead: {
    opacity: 0.7,
    color: theme.palette.text.primary,
  },

  dashboardName: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    minWidth: '10rem',
    paddingLeft: theme.spacing(5),
  },

  tableHeader: {
    minWidth: '12rem',
  },

  dashboardNameHead: {
    margin: '0 auto',
    marginTop: theme.spacing(2.5),
  },

  dashboardType: {
    marginTop: theme.spacing(2.5),
  },

  nameContent: {
    display: 'flex',
    flexDirection: 'row',
  },

  nameContentIcons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  markerIconDown: {
    color: theme.palette.text.hint,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  markerIconUp: {
    color: theme.palette.text.hint,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  tableData: {
    paddingRight: theme.spacing(2),
  },

  options: {
    minWidth: '4rem',
    paddingRight: theme.spacing(2),
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

  tablePagination: {
    marginTop: theme.spacing(-0.25),
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
  },

  selectDate: {
    display: 'flex',
    height: '2.9rem',
    minWidth: '9rem',
    border: `0.1px solid ${theme.palette.border.main}`,
    borderRadius: 4,
    marginRight: theme.spacing(1.5),
    textTransform: 'none',
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    height: '2.8rem',
    minWidth: '9rem',
  },

  dashboardTypeForm: {
    marginRight: theme.spacing(2.5),
  },

  dataSourceTypeForm: {
    marginRight: theme.spacing(2.8),
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  menuItem: {
    width: '10rem',
    height: '2.5rem',
  },

  dateRangeDefault: {
    padding: theme.spacing(1),
  },

  addButton: {
    margin: theme.spacing(0, 2),
  },

  icon: {
    width: '6rem',
    height: '6rem',
  },

  modalHeading: {
    marginTop: theme.spacing(3.5),
    fontSize: '2.25rem',
    marginBottom: theme.spacing(4.5),
  },

  modalBody: {
    marginBottom: theme.spacing(4.5),
  },

  closeButton: {
    borderColor: theme.palette.border.main,
  },

  flexButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  buttonOutlineWarning: {
    borderColor: theme.palette.error.dark,
  },

  modal: {
    padding: theme.spacing(15, 0),
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
    height: '2.9rem',
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
