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
  },

  root: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  adjust: {
    marginLeft: theme.spacing(-2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },

  plot: {
    marginTop: theme.spacing(2),
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
  },

  mainDivRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    margin: theme.spacing(1),
  },

  typographyScores: {
    fontWeight: 500,
    fontSize: '0.75rem',
  },

  typographyScoresResult: {
    fontWeight: 500,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(2.5),
  },
}));

export default useStyles;
