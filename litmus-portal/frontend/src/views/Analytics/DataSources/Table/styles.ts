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

  tableRow: {
    height: '4.5rem',
  },

  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.primary,
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

  dataSourceStatusForm: {
    marginRight: theme.spacing(2.5),
  },

  dataSourceNameForm: {
    marginRight: theme.spacing(2.8),
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

  addButton: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(1),
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
    marginTop: 'auto',
  },
  flexButtonsPadding: {
    padding: theme.spacing(5.5, 6.5, 0, 0),
  },
  modal: {
    padding: theme.spacing(5, 0),
  },
  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },
  confirmButtonText: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 3),
  },
  cancelButton: {
    width: 'fit-content',
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0, 3),
  },

  // drawer
  drawer: {
    width: 'fit-content',
    flexShrink: 0,
  },
  drawerPaper: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
  },
  drawerContent: {
    height: '100%',
    width: '50%',
    marginLeft: '50%',
    background: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(10, 6.5),
  },
  closeButton: {
    borderColor: theme.palette.border.main,
    color: theme.palette.border.main,
    padding: theme.spacing(0.25, 2),
    minWidth: 0,
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  drawerHeading: {
    fontSize: '1.5rem',
    lineHeight: '130%',
    fontFeatureSettings: 'pnum on, lnum on',
  },
  warningBlock: {
    margin: theme.spacing(5, 0),
    padding: theme.spacing(0.5, 3),
    borderLeft: `5px solid ${theme.palette.warning.main}`,
    borderRadius: '5px 0px 0px 5px',
    background: theme.palette.warning.light,
  },
  warningText: {
    margin: theme.spacing(1.5, 0),
    fontSize: '0.875rem',
    lineHeight: '143%',
  },
  drawerBodyText: {
    fontSize: '1rem',
    lineHeight: '150%',
    marginBottom: theme.spacing(3),
  },
  dashboardsList: {
    maxHeight: '12rem',
    overflowY: 'scroll',
    marginBottom: theme.spacing(3),
  },
  drawerListItem: {
    marginBottom: theme.spacing(2),
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
