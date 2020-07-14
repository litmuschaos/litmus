import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    overflowY: 'auto',
    maxHeight: 350,
  },
  popoverPaper: {
    width: '100%',
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 270,
    },
  },
  divider: {
    marginTop: -2,
  },
  noShadow: {
    boxShadow: 'none !important',
  },
}));

export default useStyles;
