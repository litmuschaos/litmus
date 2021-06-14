import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: '100%',
    height: '100%',
  },
  drawerPaper: {
    width: '100%',
    background: theme.palette.sidebarMenu,
    position: 'relative',
  },

  drawerListItem: {
    height: '3.1875rem',
    transition: '0.8s',
    '&:hover': {
      backgroundColor: theme.palette.disabledBackground,
    },
  },
  active: {
    backgroundColor: `${theme.palette.cards.highlight} !important`,
    color: theme.palette.highlight,
    '& path': {
      fill: theme.palette.highlight,
    },
  },
  listIcon: {
    paddingLeft: theme.spacing(2),
  },
  listText: {
    '& span': {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  drawerList: {
    marginTop: theme.spacing(8.375),
    '& #quickActions': {
      width: '80%',
      border: `1px solid ${theme.palette.border.main}`,
    },
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
