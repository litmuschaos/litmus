import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    borderBottom: '1px solid #e8e8e8',
    flexGrow: 1,
    maxWidth: '63.75rem',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginLeft: theme.spacing(11),
  },
  tab: {},
  Head: {
    fontSize: '2.25rem',
    marginLeft: theme.spacing(11),
    marginTop: theme.spacing(4.875),
    marginBottom: theme.spacing(3.5),
  },
}));
export default useStyles;
