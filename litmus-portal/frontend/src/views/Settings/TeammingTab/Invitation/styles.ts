import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    alignItems: 'center',
    color: theme.palette.personalDetailsBodyColor,
  },
  root: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
    flexGrow: 1,
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.secondary.contrastText,
    color: theme.palette.teamingTabHeadTextColor,
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
