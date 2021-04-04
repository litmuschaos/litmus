import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  logs: {
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
    height: '15rem',
    overflowY: 'scroll',
    textAlign: 'left',
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
  },
  text: {
    fontSize: '1rem',
    padding: theme.spacing(2.5),
  },
  tabBar: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

export default useStyles;
