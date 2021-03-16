import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  binarySwitch: {
    paddingBottom: theme.spacing(2),
  },
  cityMapMarkerStyles: {
    fill: theme.palette.primary.dark,
    '& circle': {
      stroke: theme.palette.cards.background,
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      transform: 'translate(-12, -24)',
      cx: 12,
      cy: 10,
      r: 4,
    },
    '&:hover': {
      fill: theme.palette.border.main,
    },
  },
  cityMapGeography: {
    fill: theme.palette.primary.light,
    stroke: theme.palette.background.default,
    '&:hover': {
      stroke: theme.palette.background.default,
      fill: theme.palette.border.main,
    },
  },
  cityMapComposableMap: {
    width: '45vw',
    height: '30rem',
    [theme.breakpoints.down('sm')]: {
      height: '25rem',
    },
  },
  countryMapchartStyle: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
  },
  countryMapchartContentStyle: {
    width: '45vw',
    height: '30rem',
    [theme.breakpoints.down('sm')]: {
      height: '25rem',
    },
  },
  map: {
    flexGrow: 1,
    textAlign: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.cards.background,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },
}));

export default useStyles;
