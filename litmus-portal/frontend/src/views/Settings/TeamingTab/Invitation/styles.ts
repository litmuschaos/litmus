import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    alignItems: 'center',
    color: theme.palette.text.primary,
  },
  root: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    flexGrow: 1,
    maxWidth: '23.84rem',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.disabled,
  },
  Header: {
    fontSize: '2.25rem',
    marginTop: theme.spacing(7.5),
    marginLeft: theme.spacing(-34),
  },

  invitationCount: {
    fontSize: '3.75rem',
    fontWeight: 300,
  },

  active: {
    textTransform: 'capitalize',
    color: theme.palette.highlight,
    fontWeight: 500,
    fontSize: '1rem',
  },
  inActive: {
    textTransform: 'capitalize',
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.text.hint,
  },
}));
export default useStyles;
