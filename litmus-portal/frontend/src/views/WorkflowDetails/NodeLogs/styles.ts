import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: '90%',
    padding: theme.spacing(2.5),
    overflowY: 'scroll',
    background: theme.palette.common.black,
    color: theme.palette.text.secondary,
  },
  text: {
    fontSize: '1rem',
  },
}));

export default useStyles;
