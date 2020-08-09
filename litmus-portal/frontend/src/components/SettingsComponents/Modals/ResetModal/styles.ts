import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
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
  secondText: {
    width: '29.06rem',
    height: '1.6875rem',
    marginTop: theme.spacing(1.875),
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },
  resetText: {
    width: '24.43rem',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
    color: theme.palette.text.disabled,
  },
  // styles for buttons
  button: {
    textTransform: 'none',
    width: '9.25rem',
    height: '2.75rem',
    borderRadius: '0.1875rem',
    marginTop: theme.spacing(3.75),
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
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
    borderRadius: '0.1875rem',
  },
  resetPass: {
    color: theme.palette.primary.light,
  },

  copyDiv: {
    marginTop: theme.spacing(6),
    flexDirection: 'row',
    width: '10.0625rem',
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
  },
  buttonGroup: {
    display: 'flex',
    width: '12.75rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
  },
  buttonModalSucess: {
    textTransform: 'none',
    width: '9.56rem',
    height: '2.75rem',
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    marginTop: theme.spacing(3.75),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  text1Sucess: {
    width: '27.5rem',
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  textSucess: {
    width: '25.06rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
}));
export default useStyles;
