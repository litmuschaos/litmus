import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    fontSize: '0.75rem',
    '&:hover': {
      focusVisible: 'none',
      background: theme.palette.secondary.contrastText,
    },
    marginTop: theme.spacing(0.7),
    textTransform: 'none',
    fontWeight: 'normal',
  },
  textField: {
    width: '4.4375rem',
    height: '2.75rem',
    marginLeft: theme.spacing(1.875),
  },
}));
export default useStyles;
