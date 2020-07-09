import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  toggle: {
    margin: theme.spacing(1.25),
    width: '4.4375rem',
    height: '2.75rem',
    fontWeight: 'normal',
    border: '1px solid #D1D2D7',
    borderRadius: 3,
    color: theme.palette.text.primary,
  },
}));

export default useStyles;
