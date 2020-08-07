import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  paper: {
    width: '50.75rem',
    height: '39.1875rem',
    backgroundColor: theme.palette.background.paper,

    outline: 'none',
    borderRadius: '0.1875rem',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(14),
  },
  // styles for text
  text: {
    width: '23.5rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    width: '27.5rem',
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },

  // styles for buttons
  button: {
    textTransform: 'none',
    width: '6.68rem',
    height: '2.75rem',
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  buttonModal: {
    textTransform: 'none',
    width: '9.56rem',
    height: '2.75rem',
    borderRadius: 3,
    fontSize: '0.75rem',
    marginTop: theme.spacing(3.75),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  copyDiv: {
    marginTop: theme.spacing(6),
    flexDirection: 'row',
    width: '10.0625rem',
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
  },
}));
export default useStyles;
