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
    border: `1px solid ${theme.palette.cards.background}`,
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
      color: theme.palette.text.secondary,
    },
  },

  tableRows: {
    padding: theme.spacing(4),
    color: theme.palette.text.hint,
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

  disabledText: {
    color: theme.palette.text.disabled,
  },

  // Status Text Colors
  running: {
    color: theme.palette.highlight,
  },

  failed: {
    color: theme.palette.error.main,
  },

  succeeded: {
    color: theme.palette.success.main,
  },

  pending: {
    color: theme.palette.text.primary,
  },

  status: {
    display: 'flex',
    flexDirection: 'row',
  },

  icon: {
    marginRight: theme.spacing(1),
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
}));

export default useStyles;

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);
