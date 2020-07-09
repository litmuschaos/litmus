import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  datePicker: {
    width: '9.875rem',
    height: '2.75rem',
    margin: theme.spacing(1.25),
  },
}));

export default useStyles;
