import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Choose A Workflow Component Styles
  rootcontainer: {
    background: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    margin: '0 auto',
    paddingBottom: theme.spacing(10),
    width: '80%',
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

    '& .MuiSelect-icon': {
      color: theme.palette.text.primary,
    },
  },
  formControl: {
    height: '2.5rem',
    marginRight: theme.spacing(2.5),
    minWidth: '14rem',
  },

  heading: {
    color: theme.palette.common.black,
    fontSize: 36,
    lineHeight: '130.02%',
    marginBottom: theme.spacing(5),
    marginLeft: theme.spacing(20),
    marginTop: theme.spacing(5),
    textAlign: 'left',
  },
  headchaos: {
    color: theme.palette.common.black,
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(20),
    textAlign: 'left',
  },
  headcluster: {
    marginLeft: theme.spacing(20),
    textAlign: 'left',
  },
  radiobutton: {
    marginLeft: theme.spacing(20),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(3),
    textAlign: 'left',
  },
  button: {
    marginLeft: theme.spacing(18),
  },
  buttonDiv: {
    alignContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    marginTop: theme.spacing(6),
  },
  marginTemporary: {
    marginTop: theme.spacing(1.5),
  },
}));

export default useStyles;
