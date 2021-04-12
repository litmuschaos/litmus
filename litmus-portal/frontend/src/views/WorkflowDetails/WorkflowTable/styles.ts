import {
  createStyles,
  makeStyles,
  TableCell,
  Theme,
  withStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },

  // Table and Table Data Properties
  tableMain: {
    backgroundColor: theme.palette.cards.background,
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
    '&:not(:last-child)': {
      borderBottom: 0,
    },
  },

  tableHead: {
    height: '4.6875rem',
    '& p': {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      opacity: 0.6,
    },
    '& th': {
      backgroundColor: theme.palette.cards.background,
      color: theme.palette.text.hint,
    },
  },

  tableRows: {
    padding: theme.spacing(4),
    height: '4.6875rem',
  },

  tableCellWidth: {
    maxWidth: '16.625rem',
  },

  // Table Cell Buttons
  applicationDetails: {
    display: 'flex',
  },

  viewLogs: {
    marginLeft: theme.spacing(1),
    color: theme.palette.highlight,
  },

  arrowMargin: {
    marginLeft: theme.spacing(1),
  },

  // Pagination
  pagination: {
    marginTop: theme.spacing(-0.25),
    borderTop: `1px solid ${theme.palette.border.main}`,
    width: '100%',
  },

  primaryText: {
    color: theme.palette.text.primary,
  },

  popover: {
    padding: theme.spacing(2),
  },

  popoverItems: {
    textAlign: 'left',
    margin: theme.spacing(1, 'auto'),
  },

  boldText: {
    fontWeight: 'bold',
  },
}));

export default useStyles;

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);
