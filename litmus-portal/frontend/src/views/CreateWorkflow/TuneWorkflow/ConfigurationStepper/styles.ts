import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  btn1: {
    border: 'none !important',
    color: theme.palette.highlight,
  },

  // General Component
  generalContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  // Target Component
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  annotation: {
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(0.6),
  },
  annotationDesc: {
    fontSize: '0.75rem',
    maxWidth: '25rem',
  },
  annotationToggleBtn: {
    width: '4.5rem',
    height: '2.1875rem',
  },

  // Delete experiment
  deleteExpDiv: {
    display: 'flex',
    marginTop: theme.spacing(10),
    marginRight: theme.spacing(10),
    marginLeft: theme.spacing(3.125),
    justifyContent: 'space-between',
  },

  editExpText: {
    fontSize: '1.5rem',
  },

  deleteBtn: {
    border: `1px solid ${theme.palette.error.main}`,
  },

  deleteIcon: {
    marginRight: theme.spacing(1.25),
    height: '1.25rem',
    width: '1.25rem',
  },

  deleteExpText: {
    marginTop: theme.spacing(0.625),
  },

  // Stepper styles
  stepperLabel: {
    '& .MuiStepLabel-label': {
      color: theme.palette.common.black,
      fontSize: '1rem',
    },
  },
}));
export default useStyles;
