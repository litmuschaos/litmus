import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    background: theme.palette.background.paper,
  },
  stepper: {
    marginTop: theme.spacing(5),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    marginLeft: '9%',
  },
  yamlError: {
    marginTop: theme.spacing(1.5),
  },
  activeLabel: {
    color: theme.palette.secondary.main,
    marginTop: theme.spacing(-9),
    fontWeight: 'bold',
    fontSize: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.spacing(1),
    },
  },
  normalLabel: {
    color: theme.palette.grey[600],
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
    color: theme.palette.common.black,
  },
  headWorkflow: {
    fontsize: '2rem',
    lineheight: '170%',
    textalign: 'center',
    color: theme.palette.common.black,
    marginTop: theme.spacing(3),
  },
  button: {
    color: theme.palette.common.white,
    textAlign: 'center',
    marginTop: theme.spacing(5),
  },
  successful: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
  },
}));

export default useStyles;
