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

  warningBlock: {
    margin: theme.spacing(0, 0, 4),
    padding: theme.spacing(0.5, 3),
    borderLeft: `5px solid ${theme.palette.warning.main}`,
    borderRadius: '5px 0 0 5px',
    background: theme.palette.warning.light,
    display: 'flex',
    justifyContent: 'space-between',
  },
  warningText: {
    margin: theme.spacing(1.5, 0),
    fontSize: '1rem',
    lineHeight: '130%',
    fontFeatureSettings: 'pnum on, lnum on',
  },
  warningActions: {
    display: 'flex',
    margin: theme.spacing(1.5),
  },
  warningButton: {
    padding: 0,
    minHeight: 0,
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    height: '29.75rem',
    backgroundColor: theme.palette.background.paper,
    minHeight: '25rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
      height: '0.2em',
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

  tableRow: {
    height: '4.5rem',
  },

  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflowX: 'auto',
    height: '6rem',
    backgroundColor: theme.palette.background.paper,
  },

  search: {
    marginLeft: theme.spacing(6),
  },

  minHeight: {
    height: '20rem',
    minHeight: '20rem',
  },

  noRecords: {
    height: '12.5rem',
    display: 'flex',
    padding: theme.spacing(7.5, 3, 5),
    justifyContent: 'center',
  },

  loading: {
    flexDirection: 'column',
    padding: theme.spacing(2, 3, 7.5),
  },

  unavailableIcon: {
    height: '3.5rem',
    width: '3.5rem',
    marginTop: theme.spacing(0.65),
  },

  noRecordsText: {
    color: theme.palette.text.hint,
    padding: theme.spacing(2),
    fontSize: '1.5rem',
    lineHeight: '150%',
    letterSpacing: '0.1176px',
  },

  dashboardNameHead: {
    marginTop: theme.spacing(2.5),
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '150%',
    color: theme.palette.text.hint,
  },

  dashboardNameHeadWithoutSort: {
    marginTop: theme.spacing(0.75),
  },

  dashboardNameCol: {
    paddingLeft: theme.spacing(4),
  },

  dashboardNameColData: {
    maxWidth: '10rem',
    fontWeight: 500,
    cursor: 'pointer',
  },

  headSpacing: {
    minWidth: '5rem',
    paddingLeft: theme.spacing(2),
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

  markerIcon: {
    color: theme.palette.text.hint,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  options: {
    minWidth: '3rem',
    paddingRight: theme.spacing(2),
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
    height: '2.75rem',
    minWidth: '9rem',
    border: `0.1px solid ${theme.palette.border.main}`,
    borderRadius: '0.25rem',
    marginRight: theme.spacing(1.5),
    textTransform: 'none',
    '&:hover': {
      borderColor: theme.palette.highlight,
    },
  },

  selectDateFocused: {
    border: `2px solid ${theme.palette.highlight}`,
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },

  tableObjects: {
    display: 'flex',
    gap: '0.5rem',
    textAlign: 'left',
    color: theme.palette.text.primary,
    fontSize: '0.75rem',
    lineHeight: '150%',
  },

  inlineIcon: {
    margin: theme.spacing(0.25, 0),
    width: '1rem',
    height: '1rem',
  },

  inlineTypeIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },

  columnDivider: {
    borderRight: `1px solid ${theme.palette.border.main}`,
  },

  dividerPadding: {
    paddingLeft: theme.spacing(4),
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    height: '2.6rem',
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

  createButton: {
    margin: theme.spacing(0, 3, 0, 1),
    padding: theme.spacing(0, 2.5),
  },

  // Menu option with icon
  menuItem: {
    width: '10rem',
    height: '2.5rem',
    '&:hover': {
      background: theme.palette.cards.highlight,
    },
  },
  headerIcon: {
    color: theme.palette.border.main,
  },
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
  deleteText: {
    color: theme.palette.error.main,
  },

  // modal
  modalHeading: {
    fontSize: '1.5rem',
    lineHeight: '130%',
    fontWeight: 'bold',
    fontFeatureSettings: 'pnum on, lnum on',
    margin: theme.spacing(2.5, 0, 4.5),
    padding: theme.spacing(0, 6.5),
  },
  modalBodyText: {
    fontSize: '1rem',
    lineHeight: '130%',
    padding: theme.spacing(0, 6.5),
  },
  flexButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(5.5, 6.5, 0, 0),
  },
  modal: {
    padding: theme.spacing(5, 0),
  },
  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },
  orText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: theme.spacing(0, 2),
  },
  disabledText: {
    color: theme.palette.text.disabled,
  },
  confirmButtonText: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 3),
  },
  cancelButton: {
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0, 3),
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

export const useOutlinedInputStyles = makeStyles((theme: Theme) => ({
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

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);

export default useStyles;
