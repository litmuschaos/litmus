import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    height: '75vh',
  },
  icon: {
    margin: theme.spacing(-0.4, 1),
    width: '1rem',
  },
  button: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(4, 0, 0, 4),
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  workflowGraph: {
    padding: '0 3rem',
    width: '100%',
  },
  workflowSideBar: {
    width: '20rem',
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
}));

export default useStyles;
