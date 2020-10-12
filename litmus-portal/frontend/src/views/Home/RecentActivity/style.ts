import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for RecentActivity.
  tabContainer: {
    overflowY: 'auto',
    height: '14rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  // Styles for RecentActivityListItem
  messageID: {
    color: theme.palette.text.disabled,
    marginLeft: theme.spacing(3),
  },
}));

export default useStyles;
