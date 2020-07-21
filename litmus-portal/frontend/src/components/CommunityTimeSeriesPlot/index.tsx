/* eslint-disable no-empty-pattern */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { string } from 'prop-types';
import { RootState } from '../../redux/reducers';
import useStyles from './styles';

const Plot = createPlotlyComponent(Plotly);

const CommunityAnalyticsPlot: React.FC = () => {
  const classes = useStyles();

  const communityData = useSelector((state: RootState) => state.communityData);

  const dailyOperators = communityData.google.dailyOperatorData;

  const dailyExperiments = communityData.google.dailyExperimentData;

  const monthlyOperators = communityData.google.monthlyOperatorData;

  const monthlyExperiments = communityData.google.monthlyExperimentData;

  const [data, setData] = React.useState({ x: [], y: [], y2: [] });

  const [currentPlotType, setPlotType] = React.useState<{ name: string }>({
    name: 'Growth',
  });

  const [currentGranularityType, setGranularityType] = React.useState<{
    name: string;
  }>({
    name: 'Monthly',
  });

  const handleChangeInType = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentPlotType;
    if (name !== currentPlotType.name) {
      setPlotType({
        ...currentPlotType,
        [name]: event.target.value as string,
      });
    }
  };

  const handleChangeInGranularity = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentGranularityType;
    if (name !== currentGranularityType.name) {
      setGranularityType({
        ...currentGranularityType,
        [name]: event.target.value as string,
      });
    }
  };

  const cumulativeSum = (timeSeriesCounts: any) => {
    const countSum = ((sum: any) => (value: any) =>
      (sum = parseInt(sum, 10) + parseInt(value, 10)))(0);
    const MappedCumulativeSum = timeSeriesCounts.map(countSum);
    return MappedCumulativeSum;
  };

  const processData = () => {
    let Operators: string[] = [];
    let Experiments: string[] = [];
    if (currentGranularityType.name === 'Daily') {
      dailyOperators.forEach((element: any, index: any) => {
        Operators.push(element.count);
        Experiments.push(dailyExperiments[index].count);
      });
    } else {
      monthlyOperators.forEach((element: any, index: any) => {
        Operators.push(element.count);
        Experiments.push(monthlyExperiments[index].count);
      });
    }

    if (currentPlotType.name === 'Growth') {
      Operators = cumulativeSum(Operators);
      Experiments = cumulativeSum(Experiments);
    }

    const rawData: any = [];
    if (currentGranularityType.name === 'Daily') {
      dailyOperators.forEach((element: any, index: any) => {
        rawData.push({
          date: element.date,
          operatorInstalls: Operators[index],
          experimentRuns: Experiments[index],
        });
      });
    } else {
      monthlyOperators.forEach((element: any, index: any) => {
        rawData.push({
          date: element.date,
          operatorInstalls: Operators[index],
          experimentRuns: Experiments[index],
        });
      });
    }

    const dataObject = { x: [] = [Date], y: [] = [string], y2: [] = [string] };

    rawData.forEach(function dateSplit(datum: any) {
      const splits = datum.date.split('-');
      dataObject.x.push(
        new Date(
          splits[0] as any,
          (splits[1] as any) - 1,
          splits[2] as any
        ) as any
      );
      dataObject.y.push(datum.operatorInstalls as any);
      dataObject.y2.push(datum.experimentRuns as any);
    });

    setData(dataObject as any);
  };

  const selectorOptions = {
    buttons: [
      {
        step: 'day',
        stepmode: 'backward',
        count: 7,
        label: '1w',
      },
      {
        step: 'day',
        stepmode: 'backward',
        count: 14,
        label: '2w',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 3,
        label: '3m',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y',
      },
      {
        step: 'all',
        label: 'default',
      },
    ],
  };

  useEffect(() => {
    processData();
  }, [currentPlotType, currentGranularityType]);

  return (
    <div style={{ alignContent: 'center' }}>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        color="secondary"
        focused
      >
        <InputLabel htmlFor="outlined-selection" className={classes.root}>
          Plot Style
        </InputLabel>
        <Select
          value={currentPlotType.name}
          onChange={handleChangeInType}
          label="Plot Type"
          inputProps={{
            name: 'name',
            id: 'outlined-selection',
          }}
          className={classes.root}
        >
          <MenuItem value="Growth">Growth</MenuItem>
          <MenuItem value="Trend">Trend</MenuItem>
        </Select>
      </FormControl>

      <FormControl
        variant="outlined"
        className={classes.formControl}
        color="secondary"
        focused
      >
        <InputLabel
          htmlFor="outlined-selection-granularity"
          className={classes.root}
        >
          Granularity
        </InputLabel>
        <Select
          value={currentGranularityType.name}
          onChange={handleChangeInGranularity}
          label="Granularity"
          inputProps={{
            name: 'name',
            id: 'outlined-selection-granularity',
          }}
          className={classes.root}
        >
          <MenuItem value="Daily">Daily</MenuItem>
          <MenuItem value="Monthly">Monthly</MenuItem>
        </Select>
      </FormControl>

      <div className={classes.plot}>
        <Plot
          data={[
            {
              type: 'scatter',
              x: data.x,
              y: data.y,
              mode: 'lines',
              name: 'Operator Installs',
              line: { color: '#109B67' },
            },
            {
              type: 'scatter',
              x: data.x,
              y: data.y2,
              mode: 'lines',
              name: 'Experiment Runs',
              yaxis: 'y2',
              line: { color: '#858CDD' },
            },
          ]}
          layout={{
            autosize: true,
            width: 640,
            height: 400,
            margin: {
              l: 60,
              r: 60,
              b: 10,
              t: 5,
              pad: 10,
            },
            xaxis: {
              rangeselector: selectorOptions as any,
              rangeslider: { visible: true },
            },
            yaxis: {
              title: 'Operators',
              side: 'left',
              showgrid: false,
            },
            yaxis2: {
              title: 'Experiments',
              side: 'right',
              overlaying: 'y',
            },
            legend: {
              x: 0,
              y: 1,
              traceorder: 'normal',
              font: {
                family: 'ubuntu',
                size: 12,
                color: '#000',
              },
              bgcolor: '#E2E2E2',
              bordercolor: '#FFFFFF',
              borderwidth: 0,
            },
          }}
          useResizeHandler
          style={{
            width: 'fit-content',
            margin: 'auto',
          }}
          config={{
            displaylogo: false,
            autosizable: true,
            responsive: true,
            frameMargins: 0.2,
            showAxisDragHandles: true,
            showAxisRangeEntryBoxes: true,
            showTips: true,
            displayModeBar: true,
            toImageButtonOptions: {
              format: 'png',
              filename: 'Litmus_Community_Stats',
              width: 1920,
              height: 1080,
              scale: 2,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CommunityAnalyticsPlot;
