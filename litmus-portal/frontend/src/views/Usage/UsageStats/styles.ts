import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  Head: {
    margin: theme.spacing(1, 0, 2.5),
  },
  litmusCard: {
    margin: theme.spacing(2.5, 5, 2.5, 0),
    borderRadius: 5,
    padding: theme.spacing(2.5, 1.875),
  },
  cardDiv: {
    marginTop: theme.spacing(2.5),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardHeader: {
    display: 'flex',
  },
  cardTitle: {
    marginLeft: theme.spacing(1.25),
  },
  cardDescription: {
    color: theme.palette.text.hint,
    marginTop: theme.spacing(1.5),
    height: '1.875rem',
  },
  usersData: {
    color: theme.palette.status.experiment.skipped,
  },
  projectData: {
    color: theme.palette.status.experiment.completed,
  },
  agentsData: {
    color: theme.palette.status.experiment.running,
  },
  schedules: {
    color: theme.palette.status.experiment.failed,
  },
  wfRuns: {
    color: theme.palette.status.experiment.omitted,
  },
  expRuns: {
    color: '#EFC078',
  },
  agentType: {
    marginLeft: 'auto',
    marginTop: theme.spacing(2.5),
  },
  agentTypeText: {
    opacity: 0.5,
  },
  dataField: {
    marginTop: theme.spacing(1.875),
    fontSize: '1.875rem',
  },
}));
export default useStyles;
