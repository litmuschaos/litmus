import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  headingSection: {
    display: 'flex',
  },
  pageHeading: {
    flexGrow: 1,
  },
  heading: {
    fontSize: '2rem',
    marginBottom: theme.spacing(0.875),
  },
  subHeading: {
    fontSize: '1rem',
    marginBottom: theme.spacing(4.125),
  },
  sectionHeading: {
    fontSize: '1.5rem',
    fontWeight: 500,
    flexGrow: 1,
  },
  infoStatsHeader: {
    padding: theme.spacing(3.5),
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  infoStatsSection: {
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(2.5, 3.25),
    marginBottom: theme.spacing(5.125),
  },
  infoStats: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3, 3.875),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '& div': {
      padding: theme.spacing(1),
    },
    // Regularity info stat section fix for smaller screens
    '& div:last-child': {
      width: '20rem',
    },
  },
  infoHeader: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  infoHint: {
    color: theme.palette.text.hint,
  },
  heatmapArea: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    overflow: 'hidden',
  },
  heatmapAreaHeading: {
    display: 'flex',
    alignItems: 'center',
  },
  heatmap: {
    display: 'grid',
    placeContent: 'center',
  },
  heatmapBorder: {
    minHeight: '20rem',
    border: `1px solid ${theme.palette.border.main}`,
    padding: theme.spacing(1.5, 3.5, 2.5, 2.5),
  },
  formControlParent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(0, 0, 3, 0),
  },
  noData: {
    height: '25vh',
    marginTop: theme.spacing(3),
    border: `1px solid ${theme.palette.border.main}`,
  },
}));

export default useStyles;
