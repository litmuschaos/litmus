import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    backgroundColor: theme.palette.background.default,
    height: '5rem',
    position: 'sticky',
    boxShadow: `0px 1.8px 0.6px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)`,
  },
  toolBar: {
    height: '5rem',
    display: 'flex',
    padding: theme.spacing(0, 7.5),
    '& nav': {
      flexGrow: 1,
    },
  },
  projectDropdown: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.common.black,
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
    background: theme.palette.cards.highlight,
  },
  profileDropdown: {
    margin: theme.spacing(0.25, 0, 0, 2.75),
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
