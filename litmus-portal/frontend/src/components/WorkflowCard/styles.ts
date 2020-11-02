import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  // CustomWorkflow

  customCard: {
    background: theme.palette.customColors.black(0.05),
    height: '15.625rem',
    width: '11.875rem',
    borderRadius: 3,
    fontSize: '0.875rem',
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing(3.75),
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    boxSizing: 'border-box',
  },

  customWorkflowContent: {
    margin: '1rem auto',
    fontWeight: 900,
    fontSize: '1rem',
    width: '70%',
  },

  // CardContent

  card: {
    width: theme.spacing(23),
    background: theme.palette.background.paper,
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: 14,
    margin: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.text.hint}`,
    boxSizing: 'border-box',
    '&:hover': {
      border: `1px solid ${theme.palette.secondary.dark}`,
      boxShadow: `0px 4px 4px ${theme.palette.shadow.blue}`,
    },
  },

  cardFocused: {
    border: `1px solid ${theme.palette.secondary.dark}`,
    boxShadow: `0px 4px 4px ${theme.palette.shadow.blue}`,
  },

  cardSelected: {
    background: theme.palette.background.paper,
    boxShadow: `0px 4px 4px ${theme.palette.shadow.blue}`,
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: '0.875rem',
    margin: '0 auto',
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.secondary.dark}`,
    boxSizing: 'border-box',
  },

  // CARD MEDIA
  cardMedia: {
    width: '100%',
    height: '5rem',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      height: '3.75rem',
    },
  },

  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
  },

  title: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '130%',
    color: theme.palette.primary.contrastText,
  },

  description: {
    textAlign: 'center',
    margin: '1.5rem auto',
    width: '60%',
  },

  noImage: {
    width: '100%',
    height: '5rem',
    backgroundColor: theme.palette.background.paper,
  },

  provider: {
    color: theme.palette.providerTextColor,
    fontSize: '0.75rem',
    lineHeight: '170%',
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },

  cardAnalytics: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1),
  },

  totalRuns: {
    color: theme.palette.totalRunsCountColor,
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: theme.spacing(0.375),
    lineHeight: '130%',
  },

  totalRunsSelected: {
    color: theme.palette.secondary.dark,
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: theme.spacing(0.375),
    lineHeight: '130%',
  },

  expCount: {
    backgroundColor: theme.palette.totalRunsCountColor,
    color: theme.palette.secondary.contrastText,
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    fontSize: '0.625rem',
    fontWeight: 500,
    lineHeight: '170%',
  },

  expCountSelected: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    fontSize: '0.625rem',
    fontWeight: 500,
    lineHeight: '170%',
  },

  details: {
    textAlign: 'center',
    marginBottom: theme.spacing(1.5),
  },

  moreDetails: {
    color: theme.palette.primary.dark,
  },

  horizontalLine: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  detailsText: {
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '130%',
  },
}));

export default useStyles;
