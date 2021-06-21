import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  Head: {
    margin: theme.spacing(1, 0, 2.5),
  },
  description: {
    fontWeight: 400,
    fontSize: '18px',
    marginTop: 20,
    color: theme.palette.text.hint,
  },
}));
export default useStyles;
