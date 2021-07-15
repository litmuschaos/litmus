import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    margin: '0 auto',
  },
  // Header
  headWrapper: {
    margin: theme.spacing(0.5, 'auto'),
  },
  header: {
    fontSize: '2rem',
    fontWeight: 400,
    [theme.breakpoints.up('lg')]: {
      fontSize: '2.3rem',
    },
  },
  headerButtonWrapper: {
    display: 'flex',
    width: '13rem',
    justifyContent: 'space-between',
  },
  bottomButtonWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },

  // Stepper
  stepper: {
    backgroundColor: 'transparent',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(-4),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  btn: {
    fontSize: '0.8rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    marginLeft: '9%',
    marginBottom: theme.spacing(6),
  },
  yamlError: {
    marginTop: theme.spacing(1.5),
  },
  activeLabel: {
    color: theme.palette.horizontalStepper.active,
    marginTop: theme.spacing(-9),
    fontWeight: 'bold',
    fontSize: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  normalLabel: {
    color: theme.palette.horizontalStepper.pending,
    fontSize: theme.spacing(1.5),
    marginTop: theme.spacing(-9),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  completedLabel: {
    color: theme.palette.horizontalStepper.completed,
    fontSize: theme.spacing(1.5),
    marginTop: theme.spacing(-9),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  nextArrow: {
    marginLeft: theme.spacing(2.5),
  },

  /* Finish modal content style */
  modal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(10),
    },
    padding: theme.spacing(3),
  },
  heading: {
    fontSize: '2rem',
    textalign: 'center',
    marginTop: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
  headWorkflow: {
    fontsize: '2rem',
    textalign: 'center',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(3),
  },
  button: {
    color: theme.palette.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing(5),
  },
  closeButton: {
    borderColor: theme.palette.border.main,
  },
  successful: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
  },

  // Bottom
  bottomWrapper: {
    width: '88%',
    margin: theme.spacing(1, 'auto'),
    [theme.breakpoints.up('lg')]: {
      width: '87%',
      margin: theme.spacing(2, 'auto'),
    },
  },
}));

export default useStyles;
