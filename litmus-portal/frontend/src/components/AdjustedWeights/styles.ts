import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  outerDiv: {
    marginBottom: theme.spacing(2),
  },
  innerDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '17.5625rem',
    marginBottom: theme.spacing(2.625),
  },
  typo: {
    fontSize: '0.875rem',
  },
}));

export default useStyles;
