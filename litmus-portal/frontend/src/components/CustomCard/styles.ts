import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '20rem',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 14,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    textAlign: 'center',
    cursor: 'pointer',
    // Above tablet size
    [theme.breakpoints.up('md')]: {
      width: 250,
      margin: theme.spacing(2),
    },
  },
  // CUSTOM WORKFLOW CARD
  customCard: {
    background: theme.palette.grey[200],
    boxShadow: theme.shadows[4],
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 14,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    cursor: 'pointer',
    // Above tablet size
    [theme.breakpoints.up('md')]: {
      width: 250,
      margin: theme.spacing(2),
    },
  },
  customWorkflowContent: {
    margin: '1rem auto',
    fontWeight: 900,
    fontSize: 16,
    width: '50%',
  },
  // CARD MEDIA
  cardMedia: {
    width: '100%',
    height: '5rem',
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      height: 80,
    },
  },
  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
  },
  cardBody: {
    // Below mobile size
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'start',
      padding: 8,
    },
  },
  cardInfo: {
    [theme.breakpoints.down('sm')]: {
      padding: '0 0.75rem',
    },
  },
  title: {
    fontWeight: 600,
    fontSize: 18,
    color: theme.palette.primary.contrastText,
    marginTop: theme.spacing(2),
    margin: `${theme.spacing(5)} 0`,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
    },
  },
  description: {
    textAlign: 'center',
    margin: `2rem 0.5rem`,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  noImage: {
    width: '100%',
    height: 80,
    backgroundColor: theme.palette.primary.dark,
    // Below mobile size
    [theme.breakpoints.down('sm')]: {
      width: 250,
    },
  },
  provider: {
    color: theme.palette.text.disabled,
    fontWeight: 500,
    marginBottom: 8,
  },
  cardAnalytics: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0.5rem 0.5rem 0.75rem 0.5rem',
  },
  expCount: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    borderRadius: theme.spacing(0.5),
    padding: '0.3rem 0.6rem',
    fontWeight: 500,
    fontSize: 12,
  },
  seeDetails: {
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateY(50%)',
    color: theme.palette.primary.dark,
  },
  button: {
    padding: 0,
    margin: 0,
    color: theme.palette.warning.dark,
  },
  totalRuns: {
    fontWeight: 600,
    padding: `0 0.5rem`,
    color: theme.palette.secondary.dark,
  },
}));

export default useStyles;
