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

const marks = [
  {
    value: 1,
    label: '1',
  },
  {
    value: 2,
    label: '2',
  },
  {
    value: 3,
    label: '3',
  },
  {
    value: 4,
    label: '4',
  },
  {
    value: 5,
    label: '5',
  },
  {
    value: 6,
    label: '6',
  },
  {
    value: 7,
    label: '7',
  },
  {
    value: 8,
    label: '8',
  },
  {
    value: 9,
    label: '9',
  },
  {
    value: 10,
    label: '10',
  },
];

interface CustomSliderProps {
  testName: string;
  weight: number;
  index: number;
  handleChange: (newValue: number, index: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  testName,
  weight,
  index,
  handleChange,
}) => {
  const classes = useStyles();
  return (
    <div className="App">
      <div className={classes.mainDiv}>
        <Typography className={classes.testType}>{testName}</Typography>
        <Typography>-</Typography>
        <Typography className={classes.testResult}>{weight} points</Typography>
      </div>
      <div className={classes.sliderDiv}>
        <PrettoSlider
          defaultValue={weight}
          aria-labelledby="discrete-slider-small-steps"
          step={1}
          aria-label="pretto slider"
          max={10}
          valueLabelDisplay="auto"
          marks={marks}
          onChange={(event, value) => {
            handleChange(value as any, index);
          }}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
