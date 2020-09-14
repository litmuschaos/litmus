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
    borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
    width: '13rem',
  },

  tableMain: {
    marginTop: theme.spacing(-0.5),
    border: `1px solid ${theme.palette.customColors.black(0.1)}`,
    backgroundColor: theme.palette.common.white,
    minHeight: '25rem',
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

  tableHead: {
    opacity: 0.5,
  },

  testName: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
    paddingLeft: theme.spacing(10),
  },

  testNameHead: {
    marginTop: theme.spacing(2.5),
  },

  testResultHead: {
    marginTop: theme.spacing(2.5),
    paddingLeft: theme.spacing(2),
  },

  tableObjects: {
    paddingLeft: theme.spacing(3.75),
  },

  headSpacing: {
    paddingLeft: theme.spacing(5.5),
  },

  nameContent: {
    display: 'flex',
    flexDirection: 'row',
  },

  testWeightPointHead: {
    marginTop: theme.spacing(0.5),
  },

  nameContentIcons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  buttonClose: {
    margin: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(0.75),
    paddingTop: theme.spacing(0.25),
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.dark}`,
    '&:hover': {
      border: `1px solid ${theme.palette.secondary.dark}`,
    },
    marginRight: theme.spacing(-3),
  },

  markerIconDown: {
    color: theme.palette.customColors.black(0.4),
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  markerIconUp: {
    color: theme.palette.customColors.black(0.4),
    paddingTop: theme.spacing(0.5),
    margin: 0,
  },

  tableDataStatus: {
    paddingLeft: theme.spacing(8.5),
  },

  reliabiltyData: {
    width: '8.125rem',
    paddingLeft: theme.spacing(4),
  },

  progressBar: {
    width: '6.5rem',
  },

  paginationArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    height: '4.5rem',
    backgroundColor: theme.palette.common.white,
  },

  pagination: {
    marginTop: theme.spacing(1),
  },

  toolTipGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },

  resultText: {
    fontSize: '1.125rem',
    color: theme.palette.customColors.black(0.6),
    width: '20rem',
    marginTop: theme.spacing(3),
    verticalAlign: 'middle',
    display: 'inline-flex',
    marginLeft: theme.spacing(5),
  },

  reliabilityScore: {
    fontSize: '2.25rem',
    color: theme.palette.warning.main,
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-20),
  },

  reliabilityDataTypography: {
    fontWeight: 500,
  },

  displayDate: {
    marginLeft: theme.spacing(1),
    width: '100%',
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

  rangeSelectorIcon: {
    width: '0.625rem',
    height: '0.625rem',
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

  dateRangeDefault: {
    height: '2rem',
    textDecoration: 'none',
    textTransform: 'none',
    padding: theme.spacing(1),
  },
}));

export default useStyles;
