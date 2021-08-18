import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  outerDiv: {
    marginBottom: theme.spacing(2),
  },
  innerDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '17rem',
    marginBottom: theme.spacing(2.625),
  },
  typo: {
    fontSize: '0.875rem',
  },
  points: {
    color: theme.palette.primary.dark,
  },
  progressbarDiv: {
    marginRight: theme.spacing(1.25),
  },
}));

export default useStyles;
