import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  animatedContainer: {
    marginTop: theme.spacing(3.125),
    padding: theme.spacing(2.5, 0),
    willChange: `transform`,
    transition: `transform 250ms`,
    cursor: 'pointer',

    '&:hover': {
      transform: `translateY(-10px)`,
      boxShadow: `0px 1.2px 3.6px rgba(0, 0, 0, 0.1), 0px 6.4px 14.4px rgba(0, 0, 0, 0.13)`,
      borderRadius: '0.1875rem',
    },
  },
  workflowDataContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '75%',

    '& svg': {
      width: '3.75rem',
    },

    '& circle': {
      r: '1',
      cx: '5',
      cy: '5',
    },
  },
  statusDiv: {
    display: 'flex',
  },

  testName: {
    fontWeight: 500,
    fontSize: '1.125rem',
    width: '15rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  hint: {
    fontSize: '1rem',
    color: theme.palette.text.hint,
  },

  lastRunTime: {
    width: '4.8125rem',
  },
  listContainer: {
    '& img': {
      width: '1rem',
      marginLeft: theme.spacing(2.25),
    },
    '& span': {
      marginRight: theme.spacing(1.25),
    },
  },
  listItem: {
    '&:hover': {
      background: theme.palette.cards.highlight,
    },
  },
  noWrapProvider: {
    whiteSpace: 'nowrap',
  },
  // Phase states indicating the present run status
  succeeded: {
    fill: theme.palette.success.main,
  },
  running: {
    fill: theme.palette.primary.main,
  },
  failed: {
    fill: theme.palette.error.main,
  },
  pending: {
    fill: theme.palette.primary.main,
  },
  // Resiliency Score indicators
  lowScore: {
    color: theme.palette.error.main,
  },
  mediumScore: {
    color: theme.palette.warning.main,
  },
  highScore: {
    color: theme.palette.success.main,
  },
}));

export default useStyles;
