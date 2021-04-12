import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  workflowRunContainer: {
    padding: theme.spacing(4.75, 6.25),
  },
  containerHeading: {
    display: 'flex',
    alignItems: 'center',

    '& #heading': {
      flexGrow: 1,
      fontSize: '1.5rem',
      fontWeight: 500,
    },

    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
      marginRight: theme.spacing(4.5),
    },
  },
}));

export default useStyles;
