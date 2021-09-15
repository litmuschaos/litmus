import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  workflowGraphs: {
    padding: theme.spacing(4.75, 3.75, 4.75, 10),
    height: '100%',
    filter: `drop-shadow(0px 0.3px 0.9px rgba(0, 0, 0, 0.1)) drop-shadow(0px 1.6px 3.6px rgba(0, 0, 0, 0.13))`,
  },
  graphContainer: {
    width: 'calc(38.5vw)',
    height: '300px',
    margin: theme.spacing(2.5, 0, 0, -6.25),
  },
  // Form Select Properties
  formControl: {
    margin: theme.spacing(1, 2, 0, 0),
    float: 'right',
    minWidth: '7rem',
    '& fieldset': {
      height: '3.1875rem',
    },
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
}));

export const useOutlinedInputStyles = makeStyles((theme: Theme) => ({
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
