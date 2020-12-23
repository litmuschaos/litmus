import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: '100%',
    height: '100%',
  },
  drawerPaper: {
    width: '100%',
    position: 'relative',
    backgroundColor: theme.palette.sidebarBackground,
    color: 'inherit',
  },
  litmusDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3.5),
    marginLeft: theme.spacing(4),
    '& img': {
      userDrag: 'none',
    },
  },
  homeLink: {
    textDecoration: 'none',
  },
  logo: {
    left: theme.spacing(4.375),
  },
  litmusHome: {
    width: '4.0625rem',
    height: '1.875rem',
    fontSize: '1.625rem',
    left: theme.spacing(2.25),
    top: theme.spacing(3),
    marginLeft: theme.spacing(1.75),
    color: theme.palette.primary.contrastText,
  },
  drawerListItem: {
    display: 'flex',
    height: '3.187rem',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      '& path': {
        fill: theme.palette.secondary.contrastText,
      },
    },
  },
  active: {
    backgroundColor: `${theme.palette.totalRunsCountColor} !important`,
    color: theme.palette.secondary.contrastText,
    '& path': {
      fill: theme.palette.common.white,
    },
  },
  listIcon: {
    paddingLeft: theme.spacing(2),
  },
  listText: {
    marginLeft: theme.spacing(0),
    fontSize: '1rem',
  },
  drawerList: {
    marginTop: theme.spacing(8),
    height: '16.68rem',
  },
  versionlogo: {
    width: '1.25rem',
    height: '2.185rem',
  },
  versionText: {
    margin: 'auto',
    marginLeft: theme.spacing(1.25),
    fontSize: '0.75rem',
  },
  versionDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
}));

export default useStyles;
