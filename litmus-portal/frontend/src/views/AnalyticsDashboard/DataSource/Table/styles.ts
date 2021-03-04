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

  tableRow: {
    height: '4.5rem',
  },

  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.secondary,
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
    },
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },

  binIcon: {
    width: '1.5rem',
    height: '1.5rem',
  },

  cogWheelIcon: {
    width: '1.5rem',
    height: '1.5rem',
  },

  delete: {
    color: theme.palette.error.dark,
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    height: '30.5rem',
    backgroundColor: theme.palette.background.paper,
    minHeight: '25rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tableHead: {
    opacity: 0.7,
    color: 'red',
  },

  dataSourceName: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    width: '12rem',
  },

  dataSourceType: {
    paddingLeft: theme.spacing(10.5),
    width: '10rem',
  },

  dataSourceNameHead: {
    marginTop: theme.spacing(2.5),
  },

  dataSourceStatusHead: {
    marginTop: theme.spacing(2.5),
    paddingLeft: theme.spacing(2),
  },

  headSpacing: {
    paddingLeft: theme.spacing(8),
    maxWidth: '5rem',
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

  tableDataStatus: {
    paddingLeft: theme.spacing(9),
    width: '8rem',
  },

  options: {
    width: '5rem',
  },

  tablePagination: {
    marginTop: theme.spacing(-0.25),
    height: '3.5rem',
    borderTop: `1px solid ${theme.palette.border.main}`,
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.secondary,
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

  dataSourceStatusForm: {
    marginRight: theme.spacing(2.5),
  },

  dataSourceNameForm: {
    marginRight: theme.spacing(2.8),
  },

  selectText: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  dateRangeDefault: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
  },

  addButton: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(1),
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
