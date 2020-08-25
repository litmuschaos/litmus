import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  stepper: {
    marginTop: theme.spacing(5),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  content: {
    marginLeft: theme.spacing(-8),
    marginRight: theme.spacing(-8),
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: '9%',
  },
  activeLabel: {
    color: theme.palette.primary.light,
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
  mark: {
    marginTop: theme.spacing(14),
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    textalign: 'center',
    marginTop: theme.spacing(5),
    color: theme.palette.common.black,
  },
  headWorkflow: {
    fontsize: '2rem',
    lineheight: '170%',
    textalign: 'center',
    color: theme.palette.common.black,
    marginTop: theme.spacing(6),
  },
  button: {
    color: theme.palette.common.white,
    textAlign: 'center',
    marginTop: theme.spacing(6),
  },
}));

export default useStyles;
