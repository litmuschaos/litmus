import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: '90%',
    background: theme.palette.common.black,
    color: theme.palette.common.white,
  },
}));

export default useStyles;
