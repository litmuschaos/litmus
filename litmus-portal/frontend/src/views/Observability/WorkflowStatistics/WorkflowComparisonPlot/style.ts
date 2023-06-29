import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(12),
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
    height: '1.5rem',
    width: '15rem',
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },
  menuList: {
    boxShadow: '0 5px 9px rgba(0, 0, 0, 0.1)',
  },
  menuListItem: {
    background: `${theme.palette.background.paper} !important`,
    fontSize: '0.875rem',
    lineHeight: '150%',
    height: '1.875rem',
    '&:hover': {
      background: `${theme.palette.cards.highlight} !important`,
    },
    '&.Mui-selected': {
      background: `${theme.palette.cards.highlight} !important`,
    },
  },

  flexDisplay: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    margin: 'auto',
    marginLeft: theme.spacing(6),
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    backgroundColor: theme.palette.background.paper,
  },

  root: {
    height: '3rem',
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
  },

  rootLabel: {
    height: '2rem',
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
  },

  adjust: {
    marginLeft: theme.spacing(-2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
    backgroundColor: theme.palette.background.paper,
  },

  plot: {
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },

  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
    backgroundColor: theme.palette.background.paper,
  },

  mainDivRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
  },

  typographyScores: {
    fontWeight: 500,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
  },
}));

export const useOutlinedInputStyles = makeStyles((theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.highlight,
    },
    '&$focused $notchedOutline': {
      borderColor: theme.palette.highlight,
    },
    height: '2.75rem',
  },
  focused: {},
  notchedOutline: {},
}));

export default useStyles;
