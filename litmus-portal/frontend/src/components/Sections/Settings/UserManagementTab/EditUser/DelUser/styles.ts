import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(7.5),
  },

  // styles for text
  text: {
    width: '31.93rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    width: '29.06rem',
    height: '1.6875rem',
    marginTop: theme.spacing(1.875),
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },
  button: {
    textTransform: 'none',
    width: '9.25rem',
    height: '2.75rem',
    borderRadius: 3,
    marginTop: theme.spacing(3.75),
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  // for yes or no buttons
  buttonFilled: {
    textTransform: 'none',
    width: '6.68rem',
    height: '2.75rem',
    borderRadius: '0.1875rem',
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  buttonOutline: {
    borderColor: theme.palette.secondary.dark,
    textTransform: 'none',
    width: '4.81rem',
    height: '2.75rem',
    borderRadius: 3,
  },

  buttonGroup: {
    display: 'flex',
    width: '12.75rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
  },
  // delete user
  delDiv: {
    maxWidth: '8.56rem',
    display: 'flex',
    marginTop: theme.spacing(3),
    color: '#CA2C2C',
  },
  bin: {
    marginRight: theme.spacing(1.485),
  },
}));
export default useStyles;
