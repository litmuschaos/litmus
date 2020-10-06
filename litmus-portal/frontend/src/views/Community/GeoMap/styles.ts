import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  binarySwitch: {
    paddingBottom: theme.spacing(2),
  },
  cityMapMarkerStyles: {
    fill: theme.palette.map.cityMap.marker.fill,
    '& circle': {
      stroke: theme.palette.map.cityMap.marker.stroke,
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      transform: 'translate(-12, -24)',
      cx: 12,
      cy: 10,
      r: 4,
    },
    '&:hover': {
      fill: theme.palette.map.cityMap.marker.hover,
    },
  },
  cityMapGeography: {
    fill: theme.palette.map.cityMap.geography.fill,
    stroke: theme.palette.map.cityMap.geography.stroke,
    '&:hover': {
      stroke: theme.palette.map.cityMap.geography.hover.stroke,
      fill: theme.palette.map.cityMap.geography.hover.fill,
    },
  },
  cityMapComposableMap: {
    width: '54rem',
    height: '40rem',
  },
  countryMapchartStyle: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
  },
  countryMapchartContentStyle: {
    width: '54rem',
    height: '40rem',
  },
  map: {
    flexGrow: 1,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },
  cityMap: {
    backgroundColor: theme.palette.map.cityMap.backgroundColor,
  },
  countryMap: {
    backgroundColor: theme.palette.map.countryMap.background,
  },
}));

export default useStyles;
