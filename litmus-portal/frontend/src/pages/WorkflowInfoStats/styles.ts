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
  infoHint: {
    color: theme.palette.text.hint,
  },
  heatmapArea: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    overflow: 'hidden',
    display: 'grid',
    placeContent: 'center',
  },
  heatmapAreaHeading: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(5),
  },
  formControlParent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(0, 0, 3, 0),
  },
  formControl: {
    width: '7.5rem',
  },
  heatmapBorder: {
    minHeight: '20rem',
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: '0.1875rem',
    padding: theme.spacing(1.5, 3.5, 2.5, 2.5),
  },
  heatmapParent: {
    width: '60rem',
    height: '10rem',
    position: 'relative',
  },
  heatmapLegend: {
    display: 'flex',
    marginTop: theme.spacing(3.75),
    float: 'right',

    '& img': {
      margin: theme.spacing(0, 1, 0, 1),
    },
  },
  noData: {
    height: '25vh',
    marginTop: theme.spacing(3),
    borderRadius: '0.1875rem',
    border: `1px solid ${theme.palette.border.main}`,
  },
}));

export default useStyles;
