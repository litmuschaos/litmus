import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Personal details
  headerText: {
    fontSize: '1.5625rem',
  },
  details: {
    display: 'flex',
    marginTop: theme.spacing(7.5),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginTop: theme.spacing(2.5),
    },
  },
  details1: {
    display: 'flex',
    flexWrap: 'wrap',
    '& div': {
      margin: theme.spacing(0, 1, 1, 0),
      [theme.breakpoints.down('sm')]: {
        width: 'unset',
      },
    },
  },

  edit: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
  input: {
    alignItems: 'center',
    display: 'none',
  },
  dp: {
    marginRight: theme.spacing(2.5),
  },
  // Style for ProfileDropdownSection and ProfileDropdownItems.
  avatarBackground: {
    height: '4.815rem',
    width: '4.815rem',
  },
}));
export default useStyles;
