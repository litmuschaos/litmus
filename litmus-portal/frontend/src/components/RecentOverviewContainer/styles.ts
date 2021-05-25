import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  workflowRunContainer: {
    marginTop: theme.spacing(3.125),
    padding: theme.spacing(4.75, 6.25),
  },
  containerHeading: {
    display: 'flex',
    alignItems: 'center',

    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
      marginRight: theme.spacing(4.5),
    },
  },
  heading: {
    flexGrow: 1,
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  buttonText: {
    marginLeft: theme.spacing(1),
  },
}));

export default useStyles;
