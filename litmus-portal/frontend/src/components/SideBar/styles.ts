import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    height: '100%',
    width: '100%',
  },
  drawerPaper: {
    backgroundColor: theme.palette.background.default,
    color: 'inherit',
    position: 'relative',
    width: '100%',
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
    color: theme.palette.text.primary,
    fontSize: '1.625rem',
    height: '1.875rem',
    left: theme.spacing(2.25),
    marginLeft: theme.spacing(1.75),
    top: theme.spacing(3),
    width: '4.0625rem',
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
    fontSize: '1rem',
    marginLeft: theme.spacing(0),
  },
  drawerList: {
    marginTop: theme.spacing(8.375),
  },
  versionlogo: {
    height: '2.185rem',
    width: '1.25rem',
  },
  versionText: {
    fontSize: '0.75rem',
    margin: 'auto',
    marginLeft: theme.spacing(1.25),
  },
  versionDiv: {
    fontSize: '0.75rem',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginTop: 'auto',
  },
}));

export default useStyles;
