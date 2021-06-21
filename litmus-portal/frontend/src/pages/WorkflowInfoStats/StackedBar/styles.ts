import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  stackbarHeader: {
    marginTop: theme.spacing(3),
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(4, 0),
  },
  divider: {
    width: '84%',
    marginLeft: theme.spacing(10),
    color: theme.palette.border.main,
  },
  stackbarHelperText: {
    marginTop: theme.spacing(3),
    color: theme.palette.text.hint,
  },
}));

export default useStyles;
