import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
    height: '1.5rem',
    width: '7rem',
  },

  selectText: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.4),
  },

  flexDisplay: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    width: 'fit-content',
    margin: 'auto',
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
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },

  analyticsButton: {
    height: '2.5rem',
    width: '2.5rem',
  },

  analyticsBtnPos: {
    marginTop: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(7.5),
    },
    backgroundColor: theme.palette.background.paper,
  },

  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(5),
    width: '10.75rem',
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

  button: {
    margin: theme.spacing(1),
  },

  typographyScores: {
    fontWeight: 500,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
  },

  typographyScoresResult: {
    fontWeight: 500,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(2.5),
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
