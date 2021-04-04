import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    backgroundColor: theme.palette.background.default,
    boxShadow: `0px 1.8px 0.6px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)`,
    height: '5rem',
    position: 'sticky',
  },
  toolBar: {
    display: 'flex',
    height: '5rem',
    padding: theme.spacing(0, 7.5),
    '& nav': {
      flexGrow: 1,
    },
  },
  projectDropdown: {
    alignItems: 'center',
    color: theme.palette.common.black,
    display: 'flex',
    '& button': {
      marginTop: theme.spacing(0.25),
    },
  },
  projectPopover: {
    maxHeight: '23.0625rem',
    minWidth: '26.3125rem',
    overflowY: 'auto',
    '& #hint': {
      color: theme.palette.text.hint,
    },
  },
  projectListItem: {
    '& p': {
      color: theme.palette.text.hint,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '7.9375rem',
    },
  },
  active: {
    background: theme.palette.cards.highlight,
  },
  profileDropdown: {
    margin: theme.spacing(0.25, 0, 0, 2.75),
  },
  avatarBackground: {
    backgroundColor: theme.palette.primary.main,
  },
  profileDropdownPopover: {
    minHeight: '11.3125rem',
    minWidth: '21.9375rem',
    padding: theme.spacing(3.25, 2.875),
    '& #logoutIcon': {
      marginLeft: theme.spacing(1.875),
    },
  },
  profileSet: {
    fontSize: '1rem',
    marginTop: theme.spacing(1),
  },
  profileDropdownRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileUnset: {
    marginTop: theme.spacing(1.25),
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
    },
    '& #emailUnset': {
      color: theme.palette.text.disabled,
      fontSize: '1rem',
      fontStyle: 'italic',
    },
  },
  profileButtons: {
    marginTop: theme.spacing(3.75),
  },
}));

export default useStyles;
