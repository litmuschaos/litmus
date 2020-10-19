import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '39.0625rem',
    alignItems: 'center',
    color: theme.palette.personalDetailsBodyColor,
  },

  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
}));
export default useStyles;
