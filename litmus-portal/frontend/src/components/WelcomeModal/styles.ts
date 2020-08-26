import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  /* CSS for Index */
  rootContainer: {
    paddingBottom: theme.spacing(2),
  },

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
  insideModal: {
    marginBottom: theme.spacing(10),
  },
  mark: {
    marginTop: theme.spacing(6),
    textAlign: 'center',
  },

  /* CSS for input and password field */
  inputArea: {
    width: '60%',
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
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, 0)',
    bottom: '13%',
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
  },
}));
export default useStyles;
