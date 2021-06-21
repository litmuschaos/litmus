import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  Head: {
    margin: theme.spacing(1, 0, 2.5),
  },
  litmusCard: {
    margin: '20px 40px 20px 0px',
    borderRadius: 5,
    padding: '20px 15px',
  },
}));
export default useStyles;
