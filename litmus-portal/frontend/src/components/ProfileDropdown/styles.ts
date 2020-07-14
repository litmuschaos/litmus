import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  profilePicture: {
    marginLeft: theme.spacing(0),
    paddingLeft: theme.spacing(0),
    marginTop: theme.spacing(0),
  },
  dropDown: {
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
