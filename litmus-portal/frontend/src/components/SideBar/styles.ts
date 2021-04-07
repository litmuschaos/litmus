import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: '100%',
    height: '100%',
  },
  drawerPaper: {
    width: '100%',
    backgroundColor: theme.palette.sidebarMenu,
    position: 'relative',
    color: theme.palette.text.secondary,
  },
  litmusDiv: {
    display: 'flex',
    margin: theme.spacing(2.5, 0, 0, 3.75),
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
    color: theme.palette.text.primary,
  },
  drawerListItem: {
    height: '3.1875rem',
    transition: '0.8s',
    '&:hover': {
      backgroundColor: theme.palette.disabledBackground,
    },
  },
  active: {
    backgroundColor: `${theme.palette.primary.light} !important`,
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
    marginTop: theme.spacing(8.375),
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
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    fontSize: '0.75rem',
  },
}));

export default useStyles;
