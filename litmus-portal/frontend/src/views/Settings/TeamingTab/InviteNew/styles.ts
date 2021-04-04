import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(10),
  },
  closeModal: {
    alignItems: 'center',
    display: 'flex',
    '& p': {
      color: theme.palette.disabledBackground,
      marginRight: theme.spacing(1),
    },
    '& button': {
      borderColor: theme.palette.disabledBackground,
      color: theme.palette.disabledBackground,
      maxHeight: '1.375rem',
      maxWidth: '1.375rem',
      minWidth: '1.375rem',
    },
  },
  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
}));
export default useStyles;
