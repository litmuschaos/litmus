import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import useStyles from './styles';

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
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
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
})(Slider);

const marks = [
  {
    value: 1,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
  {
    value: 4,
  },
  {
    value: 5,
  },
  {
    value: 6,
  },
  {
    value: 7,
  },
  {
    value: 8,
  },
  {
    value: 9,
  },
];

interface CustomSliderProps {
  testName: string;
  value: number;
  onChangeCommitted: (event: object, value: number | number[]) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  testName,
  value,
  onChangeCommitted,
}) => {
  const classes = useStyles();
  return (
    <div className="App">
      <div className={classes.mainDiv}>
        <Typography className={classes.testType}>{testName}</Typography>
        <Typography>-</Typography>
        <Typography className={classes.testResult}>{value} points</Typography>
      </div>
      <div className={classes.sliderDiv}>
        <PrettoSlider
          defaultValue={value}
          aria-labelledby="discrete-slider-small-steps"
          step={1}
          aria-label="pretto slider"
          max={10}
          valueLabelDisplay="auto"
          marks={marks}
          onChange={onChangeCommitted}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
