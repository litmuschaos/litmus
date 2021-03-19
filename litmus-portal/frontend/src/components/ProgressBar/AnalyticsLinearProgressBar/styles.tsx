import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: '5rem',
    height: '1rem',
  },
  redColorPrimary: {
    backgroundColor: theme.palette.error.main,
  },
  greenColorPrimary: {
    backgroundColor: theme.palette.success.main,
  },
  yellowColorPrimary: {
    backgroundColor: theme.palette.warning.main,
  },
}));

export default useStyle;