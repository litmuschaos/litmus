import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3),
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
}));

export default useStyles;
