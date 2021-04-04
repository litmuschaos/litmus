import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  datePicker: {
    height: '2.75rem',

    marginRight: theme.spacing(1.875),
    width: '9.875rem',
  },
  MuiDialogActionsRoot: {
    display: 'flex',
    justifyContent: 'flexStart',
    padding: 8,
  },
}));

export default useStyles;
