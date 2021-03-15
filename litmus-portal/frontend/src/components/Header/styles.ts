import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    backgroundColor: '#F5F6F8',
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
    minWidth: '18.625rem',
    maxHeight: '20.6875rem',
    overflowY: 'auto',
    '& #hint': {
      color: theme.palette.text.hint,
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
    minWidth: '18.4375rem',
    minHeight: '11.3125rem',
    '& div:nth-child(2)': {
      marginLeft: theme.spacing(1.375),
    },
    '& button': {
      marginTop: theme.spacing(3.75),
    },
    '& #logoutIcon': {
      marginLeft: theme.spacing(1.875),
    },
  },
  profileInfo: {
    display: 'flex',
    '& #userName': {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
}));

export default useStyles;
