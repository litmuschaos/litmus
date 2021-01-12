import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  binarySwitch: {
    paddingBottom: theme.spacing(2),
  },
  cityMapMarkerStyles: {
    fill: '#2B39A5',
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
      fill: '#808000',
    },
  },
  cityMapGeography: {
    fill: '#BFEAFF',
    stroke: '#CFCFCF',
    '&:hover': {
      stroke: '#EEFFFF',
      fill: '#CBCED3',
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
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },
  cityMap: {
    backgroundColor: theme.palette.cards.background,
  },
  countryMap: {
    backgroundColor: theme.palette.cards.background,
  },
}));

export default useStyles;
