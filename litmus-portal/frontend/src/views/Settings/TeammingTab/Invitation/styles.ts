import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    alignItems: 'center',
    color: 'none',
  },
  root: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    flexGrow: 1,
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.secondary.contrastText,
    color: theme.palette.text.primary,
  },
  button: {
    marginRight: theme.spacing(-2),
  },
  Header: {
    fontSize: '2.25rem',
    marginTop: theme.spacing(7.5),
    marginLeft: theme.spacing(-34),
  },
}));
export default useStyles;
