import Slider from '@material-ui/core/Slider';
import { Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import useStyles from './styles';

const PrettoSlider = withStyles((theme: Theme) => ({
  root: {
    background: 'transparent',
    height: '0.5rem',
  },
  track: {
    background:
      'linear-gradient(90deg, #5B44BA 0%, #858CDD 49.48%, #109B67 100%)',
    height: '2.374rem',
    borderRadius: 4,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    '&[style="left: 0%; width: 100%;"]': {
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
  },
  thumb: {
    opacity: 0,
  },
  mark: {
    marginLeft: theme.spacing(-0.85),
    paddingTop: theme.spacing(0.225),
    backgroundImage: `url(${'./icons/arrow.svg'})`,
    backgroundColor: 'transparent',
    '&[data-index="9"]': {
      background: 'transparent',
    },
    backgroundSize: 'cover',
    height: '2.4375rem',
    width: '0.75rem',
    marginTop: theme.spacing(-0.25),
  },
  markActive: {
    backgroundImage: `url(${'./icons/arrow.svg'})`,
    background: 'transparent',
    opacity: 1,
  },
  rail: {
    height: '2.375rem',
    background: '#C9C9CA',
    borderRadius: 4,
  },
  valueLabel: {
    top: -22,
    '& *': {
      background: 'transparent',
      color: theme.palette.background.paper,
    },
  },
  markLabel: {
    fontFamily: 'Ubuntu',
    fontSize: '0.9375rem',
    marginTop: theme.spacing(-0.625),
    marginLeft: '-5%',
    color: 'black',
    opacity: 0.4,
  },
  markLabelActive: {
    fontFamily: 'Ubuntu',
    fontSize: '0.9375rem',
    color: theme.palette.background.paper,
    opacity: 1,
  },
}))(Slider);
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
const WeightSlider: React.FC<CustomSliderProps> = ({
  testName,
  weight,
  index,
  handleChange,
}) => {
  const classes = useStyles();
  return (
    <div className="App" data-cy="ExperimentWeightSlider">
      <div className={classes.mainDiv}>
        <Typography className={classes.testType}>{testName}</Typography>
        <Typography>-</Typography>
        <Typography className={classes.testResult} data-cy="ExperimentWeight">
          {weight} points
        </Typography>
      </div>
      <div className={classes.sliderDiv} data-cy="WeightSlider">
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
export default WeightSlider;
