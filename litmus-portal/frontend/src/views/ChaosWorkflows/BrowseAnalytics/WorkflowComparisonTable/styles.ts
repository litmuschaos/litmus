import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    marginTop: theme.spacing(-7),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(-1),
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
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(-1),
    width: '100%',
  },

  headerSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    height: '5.55rem',
    backgroundColor: theme.palette.homePageCardBackgroundColor,
  },

  search: {
    marginRight: 'auto',
    marginLeft: theme.spacing(6.25),
    borderBottom: `1px solid ${theme.palette.customColors.black(0.07)}`,
  },

  calIcon: {
    color: `${theme.palette.customColors.black(0.4)}`,
    marginLeft: theme.spacing(3.5),
  },

  formSize: {
    height: '2.75rem',
    padding: theme.spacing(0.5),
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    backgroundColor: theme.palette.homePageCardBackgroundColor,
    maxHeight: '30.15rem',
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
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    backgroundColor: theme.palette.common.white,
    height: '15rem',
    overflow: 'hidden',
  },

  tableBody: {
    backgroundColor: theme.palette.background.paper,
  },
  tableMainShowAll: {
    marginTop: theme.spacing(4.25),
    border: `1px solid ${theme.palette.customColors.black(0.07)}`,
    backgroundColor: theme.palette.common.white,
    maxHeight: '30.15rem',
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
    borderRight: `1px solid ${theme.palette.customColors.black(0.07)}`,
    paddingTop: theme.spacing(2.5),
    maxWidth: '16.5rem',
  },

  workflowNameHead: {
    marginTop: theme.spacing(2),
  },

  tableObjects: {
    paddingLeft: theme.spacing(3.75),
  },

  headSpacing: {
    paddingLeft: theme.spacing(6),
  },

  nameContent: {
    color: theme.palette.secondary.contrastText,
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
    paddingTop: theme.spacing(0.5),
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
    color: `${theme.palette.customColors.black(0.4)}`,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  markerIconUp: {
    color: `${theme.palette.customColors.black(0.4)}`,
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  seeAllText: {
    color: `${theme.palette.customColors.black(0.6)}`,
    fontWeight: 500,
  },

  backgroundFix: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.contrastText,
    width: '100%',
    height: '45rem',
    marginBottom: theme.spacing(-2),
  },

  comparisonHeadingFix: {
    marginLeft: theme.spacing(8),
  },

  buttonSeeAnalytics: {
    alignContent: 'left',
    transform: 'rotate(-90deg)',
  },

  // Form Select Properties
  formControl: {
    margin: theme.spacing(0.5),
    marginRight: theme.spacing(1.5),
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
    border: '0.125rem solid',
    borderRadius: 4,
    borderColor: theme.palette.secondary.main,
    marginRight: theme.spacing(3),
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

  export: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    textAlign: 'center',
    borderRadius: 3,
    paddingBottom: theme.spacing(1),
  },

  noData: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.contrastText,
    width: '100%',
    height: '25rem',
    marginBottom: theme.spacing(-2),
    paddingTop: theme.spacing(22.5),
  },

  exportIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    display: 'block',
    backgroundColor: theme.palette.secondary.contrastText,
    width: '1.5rem',
    height: '1.5rem',
  },

  regularityData: {
    maxWidth: '17rem',
    marginLeft: theme.spacing(-1),
  },

  iconDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(3),
  },

  paddedText: {
    paddingLeft: theme.spacing(1.25),
  },
}));

export default useStyles;
