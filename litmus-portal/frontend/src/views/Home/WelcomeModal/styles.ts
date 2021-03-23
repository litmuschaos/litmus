import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  /* CSS for Modal Page Component */
  heading: {
    fontSize: '2rem',
    textalign: 'center',
    marginTop: theme.spacing(3),
    color: theme.palette.common.black,
  },
  infoHeading: {
    fontfamily: theme.typography.fontFamily,
    fontsize: '2rem',
    textalign: 'center',
    color: theme.palette.common.black,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  modal: {
    overflowY: 'hidden',
  },
  insideModal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(15),
    },
    paddingBottom: theme.spacing(12),
    padding: theme.spacing(5),
  },
  mark: {
    marginTop: theme.spacing(6),
    textAlign: 'center',
  },

  /* CSS for input and password field */
  inputArea: {
    width: '70%',
    margin: '1rem auto',
  },
  passwordArea: {
    width: '60%',
    margin: '0 auto',
    marginTop: theme.spacing(-3),
    marginBottom: theme.spacing(2),
  },

  /* CSS for Password Div in Stepper Component */
  passwordSetterDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(-2),
  },

  /* CSS for stepper */
  stepper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(5),
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
    gap: '1rem',
  },
}));
export default useStyles;
