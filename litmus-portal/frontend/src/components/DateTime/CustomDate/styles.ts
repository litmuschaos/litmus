import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  datePicker: {
    width: '9.875rem',
    height: '2.75rem',

    marginRight: theme.spacing(1.875),
  },
  MuiDialogActionsRoot: {
    display: 'flex',
    padding: 8,
    justifyContent: 'flexStart',
  },
}));

export default useStyles;
