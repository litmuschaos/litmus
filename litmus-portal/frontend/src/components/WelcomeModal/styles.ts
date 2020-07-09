import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      // width: 350,
      outline: 'none',
      marginTop: 30,
    },
  },
  rootContainer: {
    marginLeft: '20rem',
    marginRight: '20rem',
    marginTop: '8rem',
    marginBottom: '8rem',
    paddingBottom: '6rem',
    background: '#FFFFFF',
    borderRadius: 3,
    textAlign: 'center',
    outline: 'none',
  },
  heading: {
    fontfamily: 'Ubuntu',
    fontstyle: 'normal',
    fontweight: 'normal',
    fontSize: '40px',
    textalign: 'center',
    marginTop: '2rem',
    color: '#000000',
  },
  infoHeading: {
    fontfamily: 'Ubuntu',
    fontstyle: 'normal',
    fontweight: 'normal',
    fontsize: '16px',
    lineheight: '170%',
    textalign: 'center',
    color: '#000000',
    marginTop: '2.5rem',
    marginBottom: 15,
  },

  button: {
    width: '10rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    color: 'white',
    textAlign: 'center',
    marginTop: '2rem',
  },
  mark: {
    marginTop: 80,
    textAlign: 'center',
  },
  experimentname: {
    textAlign: 'center',
    marginBottom: 30,
  },
  stepper: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  /* CSS for input and password field */
  inputArea: {
    marginTop: theme.spacing(3.75),
    display: 'flex',
    textAlign: 'center',
    marginLeft: theme.spacing(37),
    marginRight: theme.spacing(37),
    textDecoration: 'none',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(2.2),
    borderRadius: 3,
    border: '0.0625rem solid #5B44BA',
    borderLeft: '0.1875rem solid #5B44BA',
  },
  inputDiv: {
    marginTop: theme.spacing(6.25),
    textAlign: 'center',
    marginLeft: 30,
  },
  /* CSS for stpper */
  rootStepper: {
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
  },
  activeStepper: {
    color: '#784af4',
  },
  circleStepper: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  completedStepper: {
    color: '#784af4',
    zIndex: 1,
    fontSize: 18,
  },
}));
export default useStyles;
