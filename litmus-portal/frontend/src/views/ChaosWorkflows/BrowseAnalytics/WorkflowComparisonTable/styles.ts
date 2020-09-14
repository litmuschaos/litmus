import { createMuiTheme, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    paddingBottom: theme.spacing(5),
    marginLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    overflow: 'hidden',
  },

  analyticsDiv: {
    paddingRight: theme.spacing(3.75),
  },

  heading: {
    marginTop: theme.spacing(7),
    fontFamily: 'Ubuntu',
    fontSize: '1.5rem',
  },

  description: {
    width: '50rem',
    marginTop: theme.spacing(3),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
  },

  tableFix: {
    marginTop: theme.spacing(1),
    width: '100%',
  },

  horizontalLine: {
    marginBottom: theme.spacing(2),
  },

  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid ',
    height: '6rem',
    borderColor: theme.palette.text.hint,
    backgroundColor: theme.palette.common.white,
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    width: '17.5rem',
  },

  calIcon: {
    color: 'rgba(0, 0, 0, 0.4)',
    paddingTop: theme.spacing(0.5),
    marginLeft: theme.spacing(2.75),
  },

  select: {
    width: '9.375rem',
    marginLeft: theme.spacing(1.25),
    paddingBottom: theme.spacing(2.5),
  },

  select1: {
    width: '16rem',
    marginLeft: theme.spacing(1.25),
    marginBottom: theme.spacing(1.5),
    height: '2.75rem',
    padding: theme.spacing(0.5),
    paddingRight: theme.spacing(1.75),
  },

  formSize: {
    height: '2.75rem',
    padding: theme.spacing(0.5),
  },

  headerText: {
    marginLeft: theme.spacing(3.75),
    color: theme.palette.text.disabled,
    paddingBottom: theme.spacing(0.625),
  },

  tableMain: {
    marginTop: theme.spacing(6.25),
    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.common.white,
    minHeight: '31.22rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
      outline: '1px solid slategrey',
    },
  },

  tableMainCompare: {
    marginTop: theme.spacing(-0.25),
    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.common.white,
    height: '15rem',
    overflow: 'hidden',
  },

  tableMainShowAll: {
    marginTop: theme.spacing(6.25),
    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.common.white,
    height: '29.75rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
      outline: '1px solid slategrey',
    },
  },

  seeAllPaper: {
    height: '5rem',
    backgroundColor: '#E5E5E5',
    paddingTop: theme.spacing(3.75),
    paddingBottom: theme.spacing(3.75),
    paddingLeft: '42%',
  },

  tableHead: {
    opacity: 0.5,
  },

  menuItem: {
    paddingLeft: theme.spacing(1.75),
  },

  workflowName: {
    borderRight: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.8rem',
  },

  workflowNameHead: {
    marginTop: theme.spacing(2.5),
  },

  tableObjects: {
    paddingLeft: theme.spacing(3.75),
    fontSize: '0.8rem',
  },

  headSpacing: {
    paddingLeft: theme.spacing(5.5),
  },

  tableObjectRegularity: {
    marginTop: theme.spacing(-3),
    paddingLeft: theme.spacing(7.75),
    fontSize: '0.8rem',
  },

  nameContent: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '0.8rem',
  },

  nameContentIcons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  dateRangeDefault: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
  },

  dateRange: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
    color: 'black',
  },

  checkbox: {
    paddingLeft: theme.spacing(3.75),
  },

  buttonPositionExpand: {
    alignContent: 'left',
  },

  buttonPositionClose: {
    alignContent: 'left',
    transform: 'rotate(-90deg)',
  },

  buttonBack: {
    alignContent: 'left',
    transform: 'rotate(-270deg)',
    height: '50px',
    width: '50px',
  },

  buttonBackStyle: {
    height: '70px',
    width: '70px',
  },

  popoverAnalyticsAdjust: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(0),
    [theme.breakpoints.down('xl')]: {
      transform: 'translateX(-3%)',
    },
    [theme.breakpoints.down('lg')]: {
      transform: 'translateX(1%)',
    },
    [theme.breakpoints.down('md')]: {
      transform: 'translateX(1.5%)',
    },
    [theme.breakpoints.down('sm')]: {
      transform: 'translateX(2.5%)',
    },
    [theme.breakpoints.down('xs')]: {
      transform: 'translateX(2%)',
    },
  },

  popoverAnalytics: {
    background: '#FFFFFF',
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '72.5%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '82%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '80%',
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: '85%',
    },
    marginTop: theme.spacing(1.25),
    marginLeft: theme.spacing(1),
  },

  analyticsContainer: {
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    maxHeight: theme.spacing(70),
  },

  markStyleCorrect: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: '#109B67',
  },

  button: {
    margin: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    color: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    '&:hover': {
      border: '1px solid rgba(0, 0, 0, 1)',
    },
    marginLeft: theme.spacing(2.75),
  },

  buttonCompare: {
    margin: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(0.75),
    paddingTop: theme.spacing(0.25),
    color: theme.palette.secondary.dark,
    border: '1px solid #5B44BA',
    '&:hover': {
      border: '1px solid #5B44BA',
    },
    marginRight: theme.spacing(3.25),
  },

  formLabel: {
    color: 'rgba(0, 0, 0, 0.4)',
  },

  markerIconDown: {
    color: 'rgba(0, 0, 0, 0.4)',
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  markerIconUp: {
    color: 'rgba(0, 0, 0, 0.4)',
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  tableBody: {
    height: '2rem',
  },

  seeAllText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 500,
  },

  backgroundFix: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.contrastText,
    width: '100%',
    height: 670,
    marginBottom: theme.spacing(-2),
  },

  comparisonHeadingFix: {
    marginLeft: theme.spacing(8),
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    marginRight: theme.spacing(6.25),
    height: '2.5rem',
    minWidth: '9rem',
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },

  selectDate: {
    display: 'flex',
    flexDirection: 'row',
    height: '2.5rem',
    minWidth: '9rem',
    border: '1.7px solid',
    borderRadius: 4,
    borderColor: theme.palette.secondary.main,
    marginRight: theme.spacing(3.75),
    textTransform: 'none',
  },
  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
  },
}));

export const customTheme = createMuiTheme({
  palette: {
    secondary: {
      light: '#2CCA8F',
      main: '#2CCA8F',
      dark: '#109B67',
      contrastText: '#000000',
    },
  },
});

export const customThemeCompare = createMuiTheme({
  palette: {
    secondary: {
      light: '#FFFFFF',
      main: '#FFFFFF',
      dark: '#FFFFFF',
      contrastText: '#000000',
    },
  },
});

export default useStyles;
