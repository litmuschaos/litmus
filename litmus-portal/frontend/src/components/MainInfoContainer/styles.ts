import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    marginTop: theme.spacing(3.125),
    padding: theme.spacing(6.5, 11.875),
    display: 'flex',

    '& img': {
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    },

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  containerDesc: {
    marginLeft: theme.spacing(12.5),

    '& #Heading': {
      marginBottom: theme.spacing(3.5),
      fontSize: '1.5rem',
      fontWeight: 500,
    },

    '& #desc': {
      maxWidth: '37.375rem',
    },

    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
  },
  buttonGroup: {
    marginTop: theme.spacing(5.25),
    display: 'flex',

    '& svg': {
      marginRight: theme.spacing(1.5),
    },

    '& a': {
      textDecoration: 'none',
      marginLeft: theme.spacing(1.875),
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '& p': {
        fontWeight: 500,
        fontSize: '1rem',
      },
    },
  },
}));

export default useStyles;
