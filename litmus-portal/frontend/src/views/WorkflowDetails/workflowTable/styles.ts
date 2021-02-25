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

  // Table and Table Data Properties
  tableMain: {
    border: `1px solid ${theme.palette.cards.background}`,
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
      color: theme.palette.text.secondary,
    },
  },

  columnWidth: {
    maxWidth: '16.625rem',
  },

  tableRows: {
    padding: theme.spacing(4),
    color: theme.palette.text.hint,
    height: '4.6875rem',
  },

  dark: {
    color: theme.palette.text.disabled,
  },

  // runningText: {
  //   color: theme.palette.text.disabled,
  // },

  failedText: {
    color: theme.palette.error.main,
  },

  successText: {
    color: theme.palette.success.main,
  },

  // Pagination
  pagination: {
    marginTop: theme.spacing(-0.25),
    borderTop: `1px solid ${theme.palette.border.main}`,
    width: '100%',
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
