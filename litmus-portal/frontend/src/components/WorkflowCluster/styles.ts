import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  rootcontainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.6)',
    paddingBottom: theme.spacing(10),
  },
  check: {
    marginLeft: theme.spacing(20),
    marginTop: theme.spacing(12),
    '&:hover': {
      shadow: theme.palette.secondary.dark,
    },
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
    marginLeft: theme.spacing(20),
    marginRight: theme.spacing(2), 
  },
  buttonDiv:{
    marginTop: theme.spacing(6),
    display: 'flex',
    flexDirection: 'row',
  },
  or: {
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
