import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2.5),
    marginLeft: theme.spacing(11),
    marginBottom: theme.spacing(0),
    fontFamily: 'Ubuntu',
    fontSize: '2.25rem',
    display: 'inline-block',
  },
}));

export default useStyles;
