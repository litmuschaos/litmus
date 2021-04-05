import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  logs: {
    overflowY: 'scroll',
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    height: '15rem',
    background: theme.palette.cards.header,
    color: theme.palette.text.primary,
    textAlign: 'left',
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
