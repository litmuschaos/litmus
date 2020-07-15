import Typography from '@material-ui/core/Typography';
import React from 'react';
import useStyles from './styles';
import PrettoSlider from './prettoSlider';

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
  value: number;
  onChangeCommitted: (
    event: React.ChangeEvent<{}>,
    value: number | number[]
  ) => void | undefined;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  testName,
  value,
  onChangeCommitted,
}) => {
  const classes = useStyles();
  return (
    <div className="App">
      {/* Slider Header -> Test Name and Result Value */}
      <div className={classes.mainDiv}>
        <Typography className={classes.testType}>{testName}</Typography>
        <hr className={classes.horizontalRule} />
        <Typography className={classes.testResult}>{value} points</Typography>
      </div>

      {/* Slider Div -> Range 1 to 10 */}
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
