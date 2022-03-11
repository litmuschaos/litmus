import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  logs: {
    overflowY: 'auto',
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    height: '100%',
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
    textAlign: 'left',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    padding: theme.spacing(1, 0),
  },
  text: {
    fontSize: '0.875rem',
    padding: theme.spacing(2.5),
  },
  probeStatus: {
    marginLeft: theme.spacing(3),
  },
  tabBar: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
  btn: {
    backgroundColor: `${theme.palette.common.white} !important`,
    float: 'right',
    position: 'absolute',
    right: 0,
    color: theme.palette.highlight,
    margin: theme.spacing(2.5),
  },
}));

export default useStyles;
