import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    width: '100%',
    height: '100%',
    background: theme.palette.background.default,
  },

  headerFlex: {
    height: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
  },

  headerFlexProfile: {
    color: theme.palette.userNameTextColor,
    height: '5%',
    fontSize: '2.08rem',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    marginLeft: theme.spacing(5),
    paddingleft: theme.spacing(5),
  },
  // Notification
  headerFlexPadded: {
    height: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(0),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0),
  },

  headerFlexExtraPadded: {
    height: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(0),
  },

  // Style for ProfileDropdownSection
  buttonPositionExpand: {
    alignContent: 'left',
  },

  projectDisplay: {
    marginTop: theme.spacing(-1.75),
    fontSize: 12,
    color: theme.palette.projectDisplayColor,
  },
  // Style for ProfileDropdownSection and ProfileDropdownItems.
  avatarBackground: {
    backgroundColor: theme.palette.totalRunsCountColor,
    color: theme.palette.customColors.white(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },

  // Styles for ProfileDropdownItems.
  popover: {
    background: theme.palette.customColors.white(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    maxWidth: theme.spacing(36.5),
    marginTop: theme.spacing(1.25),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxWidth: theme.spacing(36.5),
    },
  },

  popoverProfileAdjust: {
    marginTop: theme.spacing(3),
  },

  container: {
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    maxHeight: theme.spacing(70),
  },

  tabContainerProfileDropdownItem: {
    overflowY: 'auto',
    maxHeight: '21.875rem',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  userName: {
    color: theme.palette.userNameTextColor,
    fontSize: '0.875rem',
  },

  userEmail: {
    fontSize: '0.75rem',
    color: 'grey',
    paddingBottom: theme.spacing(2),
  },

  bar: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing(3),
  },

  buttonSignout: {
    borderRadius: theme.spacing(0.3),
    padding: theme.spacing(0.5, 2),
    fontSize: 12,
    textTransform: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(9),
    paddingRight: theme.spacing(9.5),
    color: theme.palette.warning.dark,
  },

  buttonEditProfile: {
    borderRadius: theme.spacing(0.3),
    padding: theme.spacing(0.5, 2),
    fontSize: '0.75rem',
    textTransform: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    color: theme.palette.buttonEditProfile,
  },

  dividerTop: {
    marginTop: theme.spacing(1),
  },

  dividerBottom: {
    marginBottom: theme.spacing(1),
  },

  // Style for ProjectListItem.
  listItemStyle: {
    height: theme.spacing(7),
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Styles for NotificationDropdown.
  notifyHeading: {
    marginTop: theme.spacing(4),
    color: theme.palette.secondary.dark,
  },

  tabContainer: {
    overflowY: 'auto',
    maxHeight: '21.875rem',
  },

  popoverPaper: {
    width: '100%',
    maxWidth: '21.875rem',
    marginTop: '1.0625rem',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxWidth: '16.875rem',
    },
  },

  divider: {
    marginTop: theme.spacing(-0.25),
  },

  noShadow: {
    boxShadow: 'none !important',
  },

  listItemSpacing: {
    marginTop: theme.spacing(-1.5),
  },
}));

export default useStyles;
