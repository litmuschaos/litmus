import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: 5,
    height: 15,
  },
  redColorPrimary: {
    backgroundColor: theme.palette.error.dark,
  },
  greenColorPrimary: {
    backgroundColor: '#109B67',
  },
  yellowColorPrimary: {
    backgroundColor: theme.palette.warning.main,
  },
}));

export default useStyle;