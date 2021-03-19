import Slider from '@material-ui/core/Slider';
import { Theme, useTheme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import useStyles from './styles';

const PrettoSlider = withStyles((theme: Theme) => ({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: 'currentColor',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
  mark: {
    opacity: 0.2,
    height: 20,
    marginTop: -5,
    backgroundColor: theme.palette.common.black,
    '&[data-index="0"]': {
      background: 'transparent',
    },
    '&[data-index="10"]': {
      background: 'transparent',
    },
  },
  markLabel: {
    marginTop: 10,
    '&[data-index="10"]': {
      color: 'black',
    },
  },
}))(Slider);

const marks = [
  {
    value: 0,
    label: '0',
  },
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
const WeightSlider: React.FC<CustomSliderProps> = ({
  testName,
  weight,
  index,
  handleChange,
}) => {
  const classes = useStyles();
  const theme = useTheme();
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
          style={{
            color:
              weight < 3
                ? theme.palette.error.main
                : weight > 3 && weight <= 6
                ? theme.palette.warning.main
                : weight > 6
                ? theme.palette.success.main
                : theme.palette.error.main,
          }}
          onChange={(event, value) => {
            handleChange(value as any, index);
          }}
        />
      </div>
    </div>
  );
};
export default WeightSlider;
