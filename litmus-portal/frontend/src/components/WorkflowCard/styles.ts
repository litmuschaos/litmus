import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  // CustomWorkflow

  customCard: {
    background: theme.palette.cards.background,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontSize: '0.875rem',
    height: '16rem',
    padding: theme.spacing(3.75),
    textAlign: 'center',
    width: '11.875rem',
  },

  customWorkflowContent: {
    fontSize: '1rem',
    fontWeight: 900,
    margin: '1rem auto',
    width: '70%',
  },

  // Tooltip
  tooltip: {
    '.MuiTooltip-tooltip': {
      maxWidth: '18.75rem',
    },
  },

  // CardContent

  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontSize: 14,
    height: '16rem',
    margin: theme.spacing(1),
    overflow: 'hidden',
    textAlign: 'center',
    width: '11.8rem',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0px 4px 4px ${theme.palette.primary.light}`,
    },
  },

  cardFocused: {
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0px 4px 4px ${theme.palette.primary.light}`,
  },

  cardSelected: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 3,
    boxShadow: `0px 4px 4px ${theme.palette.primary.light}`,
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontSize: '0.875rem',
    margin: '0 auto',
    overflow: 'hidden',
    textAlign: 'center',
  },

  // CARD MEDIA
  cardMedia: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'row',
    height: '5rem',
    justifyContent: 'center',
    width: '100%',
    '& img': {
      height: '3.75rem',
    },
  },

  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
    height: '16rem',
  },

  title: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '130%',
  },

  description: {
    margin: '1.5rem auto',
    textAlign: 'center',
    width: '60%',
  },

  noImage: {
    backgroundColor: theme.palette.background.paper,
    height: '5rem',
    width: '100%',
  },

  provider: {
    color: theme.palette.text.primary,
    fontSize: '0.75rem',
    lineHeight: '170%',
    marginBottom: theme.spacing(1),
    textAlign: 'center',
  },

  cardAnalytics: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
  },

  totalRuns: {
    color: theme.palette.primary.light,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '130%',
    marginTop: theme.spacing(0.375),
  },

  totalRunsSelected: {
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '130%',
    marginTop: theme.spacing(0.375),
  },

  expCount: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: 3,
    color: theme.palette.secondary.contrastText,
    fontSize: '0.625rem',
    fontWeight: 500,
    lineHeight: '170%',
    paddingBottom: theme.spacing(0.375),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    paddingTop: theme.spacing(0.375),
  },

  expCountSelected: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 3,
    color: theme.palette.secondary.contrastText,
    fontSize: '0.625rem',
    fontWeight: 500,
    lineHeight: '170%',
    paddingBottom: theme.spacing(0.275),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    paddingTop: theme.spacing(0.275),
  },

  details: {
    marginBottom: theme.spacing(1.5),
    textAlign: 'center',
  },

  moreDetails: {
    color: theme.palette.primary.main,
  },

  horizontalLine: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },

  detailsText: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '130%',
  },
  infrachaos: {
    alignItems: 'center',
    backgroundColor: theme.palette.warning.main,
    borderRadius: 3,
    color: theme.palette.secondary.contrastText,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(0.275, 0.75, 0.275, 0.75),
  },
  infraChaosMain: {
    fontSize: '0.625rem',
    fontWeight: 500,
  },
}));

export default useStyles;
