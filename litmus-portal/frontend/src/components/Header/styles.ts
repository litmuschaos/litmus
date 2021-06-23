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
    background: theme.palette.header,
    padding: theme.spacing(0, 7.5),
    '& *': {
      color: theme.palette.text.secondary,
    },
    '& nav': {
      flexGrow: 1,
      marginLeft: theme.spacing(15),
    },
  },
  // Logo
  litmusDiv: {
    display: 'flex',
  },
  homeLink: {
    textDecoration: 'none',
  },
  logo: {
    left: theme.spacing(4.375),
  },
  litmusHome: {
    fontSize: '1.625rem',
    marginLeft: theme.spacing(1.75),
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
    '&:hover': {
      background: `${theme.palette.cards.highlight} !important`,
    },
  },
  active: {
    background: `${theme.palette.cards.highlight} !important`,
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
    alignItems: 'center',
  },
  profileUnset: {
    marginTop: theme.spacing(1.25),
    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
  },
  emailUnset: {
    color: theme.palette.text.disabled,
    fontSize: '1rem',
  },
  projectRoleHint: {
    color: theme.palette.text.hint,
    maxWidth: '6.875rem',
    fontStyle: 'italic',
    fontSize: '0.75rem',
  },
  profileButtons: {
    marginTop: theme.spacing(3.75),
  },
}));

export default useStyles;
