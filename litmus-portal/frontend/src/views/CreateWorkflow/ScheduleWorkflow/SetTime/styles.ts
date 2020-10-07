import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    fontSize: '0.75rem',
    '&:hover': {
      focusVisible: 'none',
      background: theme.palette.secondary.contrastText,
    },
    marginTop: theme.spacing(0.7),
    textTransform: 'none',
    fontWeight: 'normal',
  },
  textField: {
    width: '4.4375rem',
    height: '2.75rem',
    marginLeft: theme.spacing(1.875),
  },
  formControlMonth: {
    margin: theme.spacing(1),
    minWidth: '5.3125rem',
    minHeight: '2.75rem',
  },

  /* for each select */
  select: {
    padding: theme.spacing(2.5),
    border: `1px solid ${theme.palette.customColors.black(0.2)}`,
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    height: '2.75rem',
  },
  opt: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.2),
    marginRight: theme.spacing(0.2),
    paddingLeft: theme.spacing(1),
    borderRadius: '0.0625rem',
    '&:hover': {
      background: theme.palette.customColors.black(0.2),
    },
  },
  menuPaper: {
    maxHeight: '12.5rem',
  },
}));
export default useStyles;
