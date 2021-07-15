import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  Head: {
    margin: theme.spacing(1, 0, 2.5),
  },
  description: {
    fontWeight: 400,
    fontSize: '1rem',
    margin: theme.spacing(3, 0),
    color: theme.palette.text.hint,
  },
  selectDate: {
    display: 'flex',
    flexDirection: 'row',
    height: '2.5rem',
    minWidth: '9rem',
    border: '0.125rem solid',
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
    borderColor: theme.palette.primary.main,
  },
  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
  },
  dateRangeDiv: {
    marginLeft: 'auto',
  },
  dateRangeIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },
}));
export default useStyles;
