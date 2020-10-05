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
    paddingTop: theme.spacing(3.75),
    width: '100%',
    marginBottom: theme.spacing(7.5),
  },
  // lines of avatars
  avatarline: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing(3.75),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  avatar: {
    marginLeft: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
    width: theme.spacing(6.25),
    height: theme.spacing(6.25),
  },
  // selected avatar
  selectedavatar: {
    border: `3px solid ${theme.palette.secondary.dark}`,
    marginLeft: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
    width: theme.spacing(6.25),
    height: theme.spacing(6.25),
  },
  checkmark: {
    height: theme.spacing(3.75),
    width: theme.spacing(3.75),
  },
}));
export default useStyles;
