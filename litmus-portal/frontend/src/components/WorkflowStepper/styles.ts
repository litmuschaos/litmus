import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '0 auto',
    width: '97.5%',
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(2, 'auto'),
      width: '98%',
    },
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
    justifyContent: 'space-between',
    width: '15%',
    [theme.breakpoints.up('lg')]: {
      width: '11%',
    },
  },
  bottomButtonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Stepper
  stepper: {
    backgroundColor: 'transparent',
    marginBottom: theme.spacing(-4),
    marginTop: theme.spacing(5),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    marginBottom: theme.spacing(6),
    marginLeft: '9%',
  },
  yamlError: {
    marginTop: theme.spacing(1.5),
  },
  activeLabel: {
    color: theme.palette.horizontalStepper.active,
    fontSize: theme.spacing(1.5),
    fontWeight: 'bold',
    marginTop: theme.spacing(-9),
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
    color: theme.palette.text.secondary,
    fontSize: '2rem',
    marginTop: theme.spacing(3),
    textalign: 'center',
  },
  headWorkflow: {
    color: theme.palette.text.secondary,
    fontsize: '2rem',
    marginTop: theme.spacing(3),
    textalign: 'center',
  },
  button: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(5),
    textAlign: 'center',
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
    margin: theme.spacing(1, 'auto'),
    width: '88%',
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(2, 'auto'),
      width: '87%',
    },
  },
}));

export default useStyles;
