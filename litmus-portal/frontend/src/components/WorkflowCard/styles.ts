import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  // CustomWorkflow

  customCard: {
    background: theme.palette.grey[200],
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: '0.875rem',
    margin: '0 auto',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(0, 0, 0, 0.2)',
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
    border: '1px solid rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box',
  },

  cardSelected: {
    background: theme.palette.background.paper,
    boxShadow: '0px 4px 4px rgba(91, 68, 186, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: '0.875rem',
    margin: '0 auto',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid #5B44BA',
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
    color: 'rgba(0, 0, 0, 0.4)',
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
    color: theme.palette.secondary.main,
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
    backgroundColor: theme.palette.secondary.main,
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
