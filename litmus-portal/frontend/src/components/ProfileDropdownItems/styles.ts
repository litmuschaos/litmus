import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  popover: {
    background: '#FFF',
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    maxWidth: theme.spacing(36.5),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxWidth: theme.spacing(36.5),
    },
  },
  container: {
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    maxHeight: theme.spacing(70),
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    margin: theme.spacing(1),
    background: theme.palette.background.default,
  },
  tabContainer: {
    overflowY: 'auto',
    maxHeight: 350,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
  },

  badgeStyle: {
    paddingLeft: 24,
    paddingTop: 24,
    marginRight: theme.spacing(3),
  },

  userName: {
    fontSize: 14,
  },
  userEmail: {
    fontSize: 12,
    color: 'grey',
    paddingBottom: theme.spacing(2),
  },
  bar: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing(3),
  },
  buttonSignout: {
    borderRadius: theme.spacing(0.3),
    padding: theme.spacing(0.5, 2),
    fontSize: 12,
    textTransform: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(9),
    paddingRight: theme.spacing(9.5),
  },

  buttonEditProfile: {
    borderRadius: theme.spacing(0.3),
    padding: theme.spacing(0.5, 2),
    fontSize: 12,
    textTransform: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
  },

  dividerTop: {
    marginTop: theme.spacing(1),
  },

  dividerBottom: {
    marginBottom: theme.spacing(1),
  },
}));

export default useStyles;
