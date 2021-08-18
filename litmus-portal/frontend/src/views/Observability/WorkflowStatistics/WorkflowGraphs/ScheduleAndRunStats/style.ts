import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  workflowGraphs: {
    padding: theme.spacing(4.75, 3.75, 4.75, 10),
    height: '100%',
    filter: `drop-shadow(0px 0.3px 0.9px rgba(0, 0, 0, 0.1)) drop-shadow(0px 1.6px 3.6px rgba(0, 0, 0, 0.13))`,
  },
  graphContainer: {
    width: '900px',
    height: '320px',
    margin: theme.spacing(2.5, 0, 0, -6.25),
  },
  formControl: {
    margin: theme.spacing(1, 2, 0, 0),
    float: 'right',
    '& fieldset': {
      height: '3.1875rem',
    },
  },
  selectText: {
    height: '2.5rem',
    color: theme.palette.text.primary,
    padding: theme.spacing(0.5),
  },
}));
export default useStyles;
