import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(3.5),
  },
  formControl: {
    margin: theme.spacing(1, 3, 0, 2),
    minWidth: '9rem',
    '& fieldset': {
      height: '3.1875rem',
    },
  },
  selectText: {
    height: '2.5rem',
    color: theme.palette.text.primary,
    padding: theme.spacing(0.5),
  },
  graphs: {
    width: '100%',
    padding: theme.spacing(4.375),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(2.5),
  },
  radialChartContainer: {
    width: '24rem',
    borderRadius: '0.1875rem',
    padding: theme.spacing(1.25, 4.125, 1.25, 4.125),
    filter: `drop-shadow(0px 0.3px 0.9px rgba(0, 0, 0, 0.1)) drop-shadow(0px 1.6px 3.6px rgba(0, 0, 0, 0.13))`,
    display: 'grid',
    placeContent: 'center',
  },
  radialChartContainerHeading: {
    fontWeight: 500,
    fontSize: '1rem',
    margin: theme.spacing(1.875, 0),
  },
  radialChart: {
    width: '18rem',
    height: '23rem',
  },
}));

export default useStyles;
