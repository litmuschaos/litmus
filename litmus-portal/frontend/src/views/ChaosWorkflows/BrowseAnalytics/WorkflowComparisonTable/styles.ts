import { makeStyles } from '@material-ui/core';

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

  formSize: {
    height: '2.75rem',
    padding: theme.spacing(0.5),
  },

  tableMain: {
    marginTop: theme.spacing(6.25),
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.common.white,
    minHeight: '31.22rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  tableMainCompare: {
    marginTop: theme.spacing(-0.25),
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.common.white,
    height: '15rem',
    overflow: 'hidden',
  },

  tableMainShowAll: {
    marginTop: theme.spacing(6.25),
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.common.white,
    height: '29.75rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },

  seeAllPaper: {
    height: '5rem',
    backgroundColor: theme.palette.paperBackground,
    paddingTop: theme.spacing(3.75),
    paddingBottom: theme.spacing(3.75),
    paddingLeft: '42%',
  },

  tableHead: {
    opacity: 0.5,
  },

  workflowName: {
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
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

  checkbox: {
    paddingLeft: theme.spacing(3.75),
  },

  buttonBack: {
    alignContent: 'left',
    transform: 'rotate(-270deg)',
    height: '3.125rem',
    width: '3.125rem',
  },

  buttonBackStyle: {
    height: '4.375rem',
    width: '4.375rem',
  },

  markStyleCorrect: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.primary.dark,
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

  seeAllText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: 500,
  },

  backgroundFix: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.contrastText,
    width: '100%',
    height: '41.875rem',
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

  headerDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3),
  },

  rootContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
  },
}));

export default useStyles;
