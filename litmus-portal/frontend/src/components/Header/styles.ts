import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    position: 'sticky',
    boxShadow: `0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)`,
  },
  toolBar: {
    height: '4.9rem',
    display: 'flex',
    background: `linear-gradient(269.82deg, #5B44BA 0.52%, #493795 99.07%)`,
    padding: theme.spacing(0, 7.5),
    '& *': {
      color: theme.palette.text.secondary,
    },
    '& nav': {
      flexGrow: 1,
    },
  },
  projectDropdown: {
    display: 'flex',
    alignItems: 'center',
    '& button': {
      marginTop: theme.spacing(0.25),
    },
  },
  projectPopover: {
    minWidth: '26.3125rem',
    maxHeight: '23.0625rem',
    overflowY: 'auto',
    '& #hint': {
      color: theme.palette.text.hint,
    },
  },
  projectListItem: {
    '& p': {
      color: theme.palette.text.hint,
      width: '7.9375rem',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
  active: {
    '& .MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover': {
      background: theme.palette.common.black,
    },
  },
  profileDropdown: {
    margin: theme.spacing(0.25, 0, 0, 2.75),
  },
  avatarBackground: {
    backgroundColor: theme.palette.primary.light,
  },
  profileDropdownPopover: {
    padding: theme.spacing(3.25, 2.875),
    minWidth: '21.9375rem',
    minHeight: '11.3125rem',
    '& #logoutIcon': {
      marginLeft: theme.spacing(1.875),
    },
  },
  profileSet: {
    marginTop: theme.spacing(1),
    fontSize: '1rem',
  },
  profileDropdownRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileUnset: {
    marginTop: theme.spacing(1.25),
    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
    '& #emailUnset': {
      color: theme.palette.text.disabled,
      fontStyle: 'italic',
      fontSize: '1rem',
    },
  },
  profileButtons: {
    marginTop: theme.spacing(3.75),
  },
}));

export default useStyles;
