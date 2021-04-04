import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    alignItems: 'center',
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
  },
  root: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    color: theme.palette.text.disabled,
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'space-between',
    marginLeft: theme.spacing(2),
    maxWidth: '23.84rem',
  },
  Header: {
    fontSize: '2.25rem',
    marginLeft: theme.spacing(-34),
    marginTop: theme.spacing(7.5),
  },

  invitationCount: {
    fontSize: '3.75rem',
    fontWeight: 300,
  },

  active: {
    color: theme.palette.highlight,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  inActive: {
    color: theme.palette.text.hint,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
}));
export default useStyles;
