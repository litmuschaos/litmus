import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Choose A Workflow Component Styles
  rootcontainer: {
    margin: '0 auto',
    width: '80%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.6)',
    paddingBottom: theme.spacing(10),
  },
  check: {
    marginLeft: theme.spacing(20),
    marginTop: theme.spacing(3),
    '&:hover': {
      shadow: theme.palette.secondary.dark,
    },
  },
  // External agent styles
  selectText: {
    height: '2.9rem',
    paddingLeft: theme.spacing(1),
  },
  formControl: {
    marginRight: theme.spacing(2.5),
    height: '2.5rem',
    minWidth: '14rem',
  },

  heading: {
    marginLeft: theme.spacing(20),
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    textAlign: 'left',
    fontSize: 36,
    lineHeight: '130.02%',
    color: theme.palette.common.black,
  },
  headchaos: {
    textAlign: 'left',
    marginLeft: theme.spacing(20),
    marginBottom: theme.spacing(1),
    color: theme.palette.common.black,
  },
  headcluster: {
    marginLeft: theme.spacing(20),
    textAlign: 'left',
  },
  radiobutton: {
    marginLeft: theme.spacing(20),
    textAlign: 'left',
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(18),
  },
  buttonDiv: {
    marginTop: theme.spacing(6),
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '1rem',
  },
  marginTemporary: {
    marginTop: theme.spacing(1.5),
  },
}));

export default useStyles;
