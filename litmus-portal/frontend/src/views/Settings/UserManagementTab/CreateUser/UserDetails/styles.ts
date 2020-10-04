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

  edit: {
    fontSize: '0.75rem',
    color: theme.palette.secondary.dark,
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
  // Style for ProfileDropdownSection and ProfileDropdownItems.
  avatarBackground: {
    backgroundColor: theme.palette.totalRunsCountColor,
    width: '4.81rem',
    height: '4.81rem',
    color: theme.palette.customColors.white(1),
    marginBottom: theme.spacing(1.625),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
}));
export default useStyles;
