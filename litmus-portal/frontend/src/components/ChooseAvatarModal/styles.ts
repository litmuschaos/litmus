import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  typo: {
    fontSize: '2.25rem',
  },
  info: {
    fontSize: '1rem',
    paddingTop: theme.spacing(2.5),
  },
  selectorbg: {
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(7.5),
    paddingTop: theme.spacing(3.75),
    width: '100%',
  },
  // lines of avatars
  avatarline: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(3.75),
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  avatar: {
    height: theme.spacing(6.25),
    marginBottom: theme.spacing(3.75),
    marginLeft: theme.spacing(3.75),
    width: theme.spacing(6.25),
  },
  // selected avatar
  selectedavatar: {
    border: `3px solid ${theme.palette.secondary.dark}`,
    height: theme.spacing(6.25),
    marginBottom: theme.spacing(3.75),
    marginLeft: theme.spacing(3.75),
    width: theme.spacing(6.25),
  },
  checkmark: {
    height: theme.spacing(3.75),
    width: theme.spacing(3.75),
  },
}));
export default useStyles;
