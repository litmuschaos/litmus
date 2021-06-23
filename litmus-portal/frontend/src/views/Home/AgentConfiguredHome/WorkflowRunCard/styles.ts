import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  animatedContainer: {
    marginTop: theme.spacing(3.125),
    padding: theme.spacing(2.5),
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
  },
  statusDiv: {
    display: 'flex',

    '& img': {
      width: '2.5rem',
      marginRight: theme.spacing(2),
    },
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
  noWrapProvider: {
    whiteSpace: 'nowrap',
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
