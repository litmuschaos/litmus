import { withStyles } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';

const PrettoSlider = withStyles({
  root: {
    backgroundColor: 'null',
    height: 8,
  },
  track: {
    background:
      'linear-gradient(90deg, #5B44BA 0%, #858CDD 49.48%, #109B67 100%)',
    height: 38,
    borderRadius: 4,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    '&[style="left: 0%; width: 100%;"]': {
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
  },
  rail: {
    height: 38,
    background: '#C9C9CA',
    borderRadius: 4,
  },
  mark: {
    backgroundSize: 'cover',
    height: 40,
    width: 10,
    marginTop: -2,
  },
  markActive: {
    opacity: 1,
  },
  valueLabel: {
    top: -22,
    '& *': {
      background: 'transparent',
      color: '#000',
    },
  },
})(Slider);

export default PrettoSlider;
