import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  workflowGraphs: {
    padding: theme.spacing(3.125, 3.75, 3.125, 10),
    height: '100%',
    marginBottom: theme.spacing(3.125),
  },
  graphContainer: {
    width: '900px',
    height: '320px',
    marginLeft: '-70px',
    marginBottom: '25px',
  },
}));
export default useStyles;
