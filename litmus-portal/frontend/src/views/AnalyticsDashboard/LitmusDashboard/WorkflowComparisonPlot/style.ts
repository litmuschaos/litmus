import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    height: '1.5rem',
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(12),
    marginTop: theme.spacing(4),
    width: '15rem',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
  },

  selectText: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(0.4),
  },

  flexDisplay: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    margin: 'auto',
    marginLeft: theme.spacing(6),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
  },

  root: {
    backgroundColor: theme.palette.background.paper,
    height: '3rem',
    padding: theme.spacing(0.5),
  },

  rootLabel: {
    backgroundColor: theme.palette.background.paper,
    height: '2rem',
    padding: theme.spacing(0.5),
  },

  adjust: {
    backgroundColor: theme.palette.background.paper,
    marginLeft: theme.spacing(-2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },

  plot: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(2),
    width: '100%',
  },

  mainDiv: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(5),
    width: '15rem',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },

  mainDivRow: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  typographyScores: {
    color: theme.palette.text.primary,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
}));

export const useOutlinedInputStyles = makeStyles((theme) => ({
  root: {
    '& $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&:hover $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    '&$focused $notchedOutline': {
      borderColor: theme.palette.border.main,
    },
    height: '2.8rem',
  },
  focused: {},
  notchedOutline: {},
}));

export default useStyles;
