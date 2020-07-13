import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FAFBFD',
  },
  breadCrumbsGrid: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
  },
  notificationSection: {
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
