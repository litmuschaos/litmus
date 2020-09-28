import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    marginTop: theme.spacing(3),
    height: '75vh',
  },
  icon: {
    margin: theme.spacing(-0.4, 1),
    width: '1rem',
  },
  w100: {
    width: '100%',
    height: '100%',
  },
  w140: {
    width: '141%',
    height: '100%',
  },
  button: {
    position: 'relative',
    display: 'flex',
    margin: theme.spacing(4, 4, 0, 4),
  },
  buttonLeft: {
    float: 'left',
  },
  buttonRight: {
    position: 'absolute',
    right: '4%',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  workflowGraph: {
    padding: '0 3rem',
    width: '70%',
  },
  loaderDiv: {
    height: '100%',
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    paddingLeft: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
  },
  footerButton: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(3, 4, 4, 0),
  },
}));

export default useStyles;
