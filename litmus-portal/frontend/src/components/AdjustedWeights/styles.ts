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
  experimentIcon: {
    marginRight: theme.spacing(0.5),
  },
  typoSpaced: {
    width: '17rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

export default useStyles;
