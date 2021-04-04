import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  outerDiv: {
    marginBottom: theme.spacing(2),
  },
  innerDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(2.625),
    width: '17rem',
  },
  typo: {
    fontSize: '0.875rem',
  },
  points: {
    color: theme.palette.primary.dark,
  },
  experimentIcon: {
    marginRight: theme.spacing(0.5),
  },
  typoSpaced: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '17rem',
  },
  progressbarDiv: {
    marginRight: theme.spacing(1.25),
  },
}));

export default useStyles;
