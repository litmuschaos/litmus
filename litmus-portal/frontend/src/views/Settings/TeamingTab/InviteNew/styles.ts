import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(10),
  },
  closeModal: {
    display: 'flex',
    alignItems: 'center',
    '& p': {
      marginRight: theme.spacing(1),
      color: theme.palette.disabledBackground,
    },
    '& button': {
      color: theme.palette.disabledBackground,
      borderColor: theme.palette.disabledBackground,
      maxWidth: '1.375rem',
      minWidth: '1.375rem',
      maxHeight: '1.375rem',
    },
  },
  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
}));
export default useStyles;
