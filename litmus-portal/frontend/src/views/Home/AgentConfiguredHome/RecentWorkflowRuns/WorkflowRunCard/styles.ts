import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  workflowDataContainer: {
    marginTop: theme.spacing(3.125),
    padding: theme.spacing(2.5, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    willChange: `transform`,
    transition: `transform 250ms`,

    '& svg': {
      width: '3.75rem',
    },

    '& circle': {
      marginRight: theme.spacing(2.25),
      stroke: theme.palette.common.black,
      cx: '5',
      cy: '5',
      r: '1',
    },

    '& #statusDiv': {
      display: 'flex',
    },

    '& #testName': {
      fontWeight: 500,
      fontSize: '1.125rem',
    },

    '& #hint': {
      fontSize: '1rem',
      color: theme.palette.text.hint,
    },

    '&:hover': {
      transform: `translateY(-10px)`,
      boxShadow: `0px 1.2px 3.6px rgba(0, 0, 0, 0.1), 0px 6.4px 14.4px rgba(0, 0, 0, 0.13)`,
      borderRadius: '0.1875rem',
    },
  },
}));

export default useStyles;
