import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: '5rem',
  },
  redColorPrimary: {
    backgroundColor: theme.palette.error.main,
  },
  redColorSecondary: {
    backgroundColor: theme.palette.error.light,
  },
  greenColorPrimary: {
    backgroundColor: theme.palette.success.main,
  },
  greenColorSecondary: {
    backgroundColor: theme.palette.success.light,
  },
  yellowColorPrimary: {
    backgroundColor: theme.palette.warning.main,
  },
  yellowColorSecondary: {
    backgroundColor: theme.palette.warning.light,
  },
}));

export default useStyle;
