import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Personal details
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
  },
  details: {
    maxWidth: '63.75rem',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    marginTop: theme.spacing(7.5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  details1: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },

    alignContent: 'flex-start',
    flexWrap: 'wrap',
  },
  orange: {
    width: '4.81rem',
    height: '4.81rem',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    marginBottom: theme.spacing(1.625),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  edit: {
    fontSize: '0.75rem',
    color: theme.palette.secondary.dark,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.75),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
      marginBottom: theme.spacing(2),
    },
  },
  input: {
    display: 'none',
    alignItems: 'center',
  },
  dp: {
    display: 'flex',
    flexDirection: 'column',

    marginRight: theme.spacing(2.5),
  },
  user: {
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '0.1875rem',
    width: '24.43rem',
    height: '4.8125rem',
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    paddingLeft: theme.spacing(3.75),
    marginBottom: theme.spacing(2.5),
  },
}));
export default useStyles;
