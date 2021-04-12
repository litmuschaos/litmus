import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  leftBannerTable: {
    flexGrow: 1,
    height: 'fit-content',
  },
  rightGlowCardQuickAction: {
    width: '15rem',
    height: 'fit-content',
  },
  overviewGraphs: {
    display: 'flex',
    width: '100%',
    height: '25rem',
    marginBottom: '2rem',
  },
  workTableIconText: {
    display: 'flex',
  },
  workflowScheduleButton: {
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(5),
  },

  dashboard: {
    flexGrow: 1,
    display: 'inline-block',
    margin: theme.spacing(2),
    height: '25rem',
    padding: '0rem',
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(4),
    fontWeight: 500,
  },
  dashboardContent: {
    display: 'flex',
    justifyContent: 'space-around',
    marginRight: theme.spacing(3),
  },
  weightedHeading: {
    fontWeight: 500,
    fontSize: '1.4rem',
  },

  parentWrapper: {
    width: 'fit-content',
    padding: theme.spacing(1),
    height: 'fit-content',
    background: 'transparent',
  },
  banner: {
    height: 'fit-content',
    minHeight: '18rem',
    width: '100%',
    overflow: 'hidden',
  },
  overviewGlowCard: {
    width: '15rem',
    height: '17.5rem',
    paddingLeft: theme.spacing(2),
  },
  analyticsScheduleWorkflowCard: {
    width: '100%',
    height: '18rem',
    marginTop: theme.spacing(1),
  },
  analyticsQuickActionCard: {
    width: '15rem',
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },

  dataTables: {
    marginTop: theme.spacing(2),
    display: 'flex',
  },
  dataTable: {
    background: theme.palette.cards.header,
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    width: '100%',
    height: 'fit-content',
    marginTop: theme.spacing(2),
  },
  tableHeading: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(3.5, 5),
  },

  dateText: {
    fontSize: '0.8rem',
    color: theme.palette.text.hint,
    fontStyle: 'italic',
  },
  dataSourceTableHeader: {
    display: 'flex',
  },
  arrowForwardIcon: {
    width: '1.75rem',
    height: '1.75rem',
  },
  seeAllArrowBtn: {
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    display: 'flex',
    '& p': {
      paddingRight: theme.spacing(2),
    },
    padding: `0 0 0 ${theme.spacing(5.75)}`,
    marginRight: theme.spacing(5.75),
  },
  seeAllBtn: {
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    display: 'flex',
    marginRight: theme.spacing(2),
  },

  seeAllText: {
    color: theme.palette.highlight,
    fontWeight: 500,
    fontSize: '1rem',
  },
  tableStyling: {
    border: 'none',
    width: '90%',
    margin: '0 auto',
  },
  tableRow: {
    display: 'flex',
    height: '4rem',
    justifyContent: 'space-between',
    borderBottom: `1rem solid ${theme.palette.cards.header}`,
    background: theme.palette.cards.background,
    '& td': {
      padding: theme.spacing(0, 1.5),
      borderBottom: `none`,
      alignSelf: 'center',
      '& img': {
        height: '1.875rem',
        width: '1.875rem',
      },
    },
    '& td:first-child': {
      paddingLeft: theme.spacing(3.75),
    },
  },
  tableRowHeader: {
    width: '35%',
  },

  dataRowName: {
    fontSize: '0.85rem',
    fontWeight: 500,
    margin: 'auto 0',
    marginLeft: theme.spacing(1),
  },
  btnFilled: {
    width: '18rem',
  },
  predefinedBtn: {
    marginTop: theme.spacing(4.5),
  },
}));

export default useStyles;
