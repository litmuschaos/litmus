/* eslint-disable max-len */
import React, { useEffect } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import moment from 'moment';
import useStyles from './style';
import Score from './Score';
// import moment from 'moment';
// import * as _ from 'lodash';

const Plot = createPlotlyComponent(Plotly);

interface ResilienceScoreComparisonPlotProps {
  xData: { Daily: string[][]; Monthly: string[][] };
  yData: { Daily: number[][]; Monthly: number[][] };
  labels: string[];
  colors: string[];
}

interface AverageDateWiseResilienceScores {
  Daily: {
    dates: string[];
    avgResilienceScores: number[];
  };
  Monthly: {
    dates: string[];
    avgResilienceScores: number[];
  };
}
/*
interface AverageDateWiseResilienceScore {
  date: string;
  avgResilienceScore: number;
}
*/
const ResilienceScoreComparisonPlot: React.FC<ResilienceScoreComparisonPlotProps> = ({
  xData,
  yData,
  labels,
  colors,
}) => {
  const classes = useStyles();

  const [currentGranularity, setCurrentGranularity] = React.useState<{
    name: string;
  }>({
    name: 'Monthly',
  });

  const handleChangeInGranularity = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentGranularity;
    if (name !== currentGranularity.name) {
      setCurrentGranularity({
        ...currentGranularity,
        [name]: event.target.value as string,
      });
    }
  };

  const [plotData, setPlotData] = React.useState<any[]>([]);

  const [edgeData, setEdgeData] = React.useState({
    highScore: 0,
    lowScore: 0,
    highColor: '',
    lowColor: '',
    highName: '',
    lowName: '',
  });

  const [plotLayout, setPlotLayout] = React.useState<any>({});

  // Function to find average
  // const average = (list: number[]) =>
  // list.reduce((prev, curr) => prev + curr) / list.length;

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('YYYY-MM-DD');
    return resDate;
  };

  /*
  // Function to calculate average of resilience scores based on common dates
  const avgWorkflowsCommon = () => {
    const averageDateWiseResilienceScores: AverageDateWiseResilienceScores = {
      Daily: {
        dates: [],
        avgResilienceScores: [],
      },
      Monthly: {
        dates: [],
        avgResilienceScores: [],
      },
    };
    for (let i = 0; i < xData.Daily[0].length; i += 1) {
      let date: string = xData.Daily[0][i]; //formatDate(xData.Daily[0][i]);
      let count: number = 0;
      const valuesForProbableCommonDate: number[] = [];
      for (let j = 0; j < xData.Daily.length; j += 1) {
        const parsedDates: string[] = [];
        xData.Daily[j].forEach(function (date: string) {
          parsedDates.push(date); //formatDate(date));
        });
        if (parsedDates.includes(date)) {
          count += 1;
          valuesForProbableCommonDate.push(
            yData.Daily[j][parsedDates.indexOf(date)]
          );
        }
      }
      if (count == xData.Daily.length) {
        averageDateWiseResilienceScores.Daily.dates.push(date);
        averageDateWiseResilienceScores.Daily.avgResilienceScores.push(
          average(valuesForProbableCommonDate)
        );
      }
    }

    for (let i = 0; i < xData.Monthly[0].length; i += 1) {
      let date: string = xData.Monthly[0][i]; //formatDate(xData.Monthly[0][i]);
      let count: number = 0;
      const valuesForProbableCommonDate: number[] = [];
      for (let j = 0; j < xData.Monthly.length; j += 1) {
        const parsedDates: string[] = [];
        xData.Monthly[j].forEach(function (date: string) {
          parsedDates.push(date); //formatDate(date));
        });
        if (parsedDates.includes(date)) {
          count += 1;
          valuesForProbableCommonDate.push(
            yData.Monthly[j][parsedDates.indexOf(date)]
          );
        }
      }
      if (count == xData.Monthly.length) {
        averageDateWiseResilienceScores.Monthly.dates.push(date);
        averageDateWiseResilienceScores.Monthly.avgResilienceScores.push(
          average(valuesForProbableCommonDate)
        );
      }
    }
    return averageDateWiseResilienceScores;
  };
*/
  /*
 // Function to group data based on dates and months
const getGroupedData = () => {
  const dailyList: AverageDateWiseResilienceScore[] = [];
  calculatedAverageAll.Daily.dates.forEach((date: string, index: number) => {
    dailyList.push({
      date: date,
      avgResilienceScore:
        calculatedAverageAll.Daily.avgResilienceScores[index],
    });
  });

  const monthlyList: AverageDateWiseResilienceScore[] = [];
  calculatedAverageAll.Monthly.dates.forEach(
    (date: string, index: number) => {
      dailyList.push({
        date: date,
        avgResilienceScore:
          calculatedAverageAll.Monthly.avgResilienceScores[index],
      });
    }
  );

  const dailyGroupedResults = _.groupBy(dailyList, (data) =>
    moment.unix(parseInt(data.date, 10)).startOf('day')
  );

  const monthlyGroupedResults = _.groupBy(monthlyList, (data) =>
    moment.unix(parseInt(data.date, 10)).startOf('month')
  );

  const avgResScores: AverageDateWiseResilienceScores = {
    Daily: {
      dates: [],
      avgResilienceScores: [],
    },
    Monthly: {
      dates: [],
      avgResilienceScores: [],
    },
  };

  Object.keys(dailyGroupedResults).forEach((day) => {
    const scoresForTheDay: AverageDateWiseResilienceScore[] =
      dailyGroupedResults[day];
    const average =
      scoresForTheDay.reduce(
        (total, next) => total + next.avgResilienceScore,
        0
      ) / scoresForTheDay.length;
    avgResScores.Daily.dates.push(day);
    avgResScores.Daily.avgResilienceScores.push(average);
  });

  Object.keys(monthlyGroupedResults).forEach((month) => {
    const scoresForTheMonth: AverageDateWiseResilienceScore[] =
      monthlyGroupedResults[month];
    const average =
      scoresForTheMonth.reduce(
        (total, next) => total + next.avgResilienceScore,
        0
      ) / scoresForTheMonth.length;
    avgResScores.Monthly.dates.push(month);
    avgResScores.Monthly.avgResilienceScores.push(average);
  });
};
*/
  // Function to calculate average of resilience scores based on all dates with range as edge dates
  const avgWorkflowsAll = () => {
    const averageDateWiseResilienceScores: AverageDateWiseResilienceScores = {
      Daily: {
        dates: [],
        avgResilienceScores: [],
      },
      Monthly: {
        dates: [],
        avgResilienceScores: [],
      },
    };

    for (let i = 0; i < xData.Daily.length; i += 1) {
      for (let j = 0; j < xData.Daily[i].length; j += 1) {
        const date: string = xData.Daily[i][j];
        let sum: number = 0;
        let count: number = 0;
        for (let k = 0; k < xData.Daily.length; k += 1) {
          if (
            xData.Daily[k].includes(date) &&
            !averageDateWiseResilienceScores.Daily.dates.includes(date)
          ) {
            sum += yData.Daily[k][xData.Daily[k].indexOf(date)];
            count += 1;
          }
        }
        if (count !== 0) {
          averageDateWiseResilienceScores.Daily.dates.push(date);
          averageDateWiseResilienceScores.Daily.avgResilienceScores.push(
            sum / count
          );
        }
      }
    }

    for (let i = 0; i < xData.Monthly.length; i += 1) {
      for (let j = 0; j < xData.Monthly[i].length; j += 1) {
        const date: string = xData.Monthly[i][j];
        let sum: number = 0;
        let count: number = 0;
        for (let k = 0; k < xData.Monthly.length; k += 1) {
          if (
            xData.Monthly[k].includes(date) &&
            !averageDateWiseResilienceScores.Monthly.dates.includes(date)
          ) {
            sum += yData.Monthly[k][xData.Monthly[k].indexOf(date)];
            count += 1;
          }
        }
        if (count !== 0) {
          averageDateWiseResilienceScores.Monthly.dates.push(date);
          averageDateWiseResilienceScores.Monthly.avgResilienceScores.push(
            sum / count
          );
        }
      }
    }
    return averageDateWiseResilienceScores;
  };

  const argSort = (arr1: number[], arr2: number[]) =>
    arr1
      .map((item: any, index: number) => [arr2[index], item]) // add the args to sort by
      .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
      .map(([, item]) => item); // extract the sorted items

  const processData = () => {
    // const calculatedAverageCommon: AverageDateWiseResilienceScores = avgWorkflowsCommon();
    // console.log(calculatedAverageCommon);
    const calculatedAverageAll: AverageDateWiseResilienceScores = avgWorkflowsAll();
    // console.log(calculatedAverageAll);

    let dataX = [['']];
    let dataY = [[0]];
    let xAvg: string[] = [];
    let yAvg: number[] = [];
    if (currentGranularity.name === 'Daily') {
      dataX = xData.Daily;
      dataY = yData.Daily;
      xAvg = calculatedAverageAll.Daily.dates;
      yAvg = calculatedAverageAll.Daily.avgResilienceScores;
    }
    if (currentGranularity.name === 'Monthly') {
      dataX = xData.Monthly;
      dataY = yData.Monthly;
      xAvg = calculatedAverageAll.Monthly.dates;
      yAvg = calculatedAverageAll.Monthly.avgResilienceScores;
    }

    //

    const lineSize: number[] = Array(labels?.length).fill(3);

    const data = [];

    const series: number[] = Array(labels?.length).fill(0);

    const lengths: number[] = Array(labels?.length).fill(0);

    for (let i = 0; i < dataX.length; i += 1) {
      const result = {
        x: dataX[i],
        y: dataY[i],
        type: 'scatter',
        mode: 'lines',
        line: {
          shape: 'spline',
          color: colors[i],
          width: lineSize[i],
        },
        name: labels ? labels[i] : '',
      };
      data.push(result);
      for (let j = 0; j < dataY[i].length; j += 1) {
        series[i] += dataY[i][j];
      }
      lengths[i] = dataY[i].length;
    }

    const unixTimeArray: number[] = [];
    xAvg.forEach((x) => {
      unixTimeArray.push(parseInt(moment(x).format('X'), 10));
    });

    const argSortResultY = argSort(yAvg, unixTimeArray).reverse();
    const sortedResultX = unixTimeArray.sort(function difference(a, b) {
      return a - b;
    });

    const datesX: string[] = [];

    sortedResultX.forEach((date) => {
      datesX.push(formatDate(date.toString()));
    });

    // console.log(datesX);
    // console.log(argSortResultY);

    const avgResult = {
      x: datesX,
      y: argSortResultY,
      type: 'scatter',
      mode: 'lines',
      line: {
        shape: 'spline',
        dash: 'dash',
        color: '5B44BA',
        width: 3,
      },
      name: 'AVG Workflows',
    };
    data.push(avgResult);

    const normalized = Array(labels?.length).fill(0);

    for (let k = 0; k < lengths.length; k += 1) {
      normalized[k] = series[k] / lengths[k];
    }

    const max = Math.max(...normalized);
    const maxID = normalized.indexOf(max);
    const min = Math.min(...normalized);
    const minID = normalized.indexOf(min);
    setEdgeData({
      highScore: max,
      lowScore: min,
      highColor: colors[maxID],
      lowColor: colors[minID],
      highName: labels ? labels[maxID] : '',
      lowName: labels ? labels[minID] : '',
    });
    setPlotData(data);
  };

  const selectorOptions = {
    buttons: [
      {
        step: 'day',
        stepmode: 'backward',
        count: 7,
        label: '1 Week',
      },
      {
        step: 'day',
        stepmode: 'backward',
        count: 14,
        label: '2 Weeks',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1 Month',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 3,
        label: '3 Months',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6 Months',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1 Year',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 2,
        label: '2 Years',
      },
      {
        step: 'all',
        label: 'default',
      },
    ],
  };

  const processLayout = () => {
    const layout = {
      xaxis: {
        showgrid: true,
        showline: false,
        showticklabels: true,
        linecolor: 'rgb(204,204,204)',
        linewidth: 0.5,
        ticks: 'outside',
        tickcolor: 'rgb(204,204,204)',
        tickwidth: 2,
        ticklen: 5,
        tickfont: {
          family: 'Ubuntu',
          color: 'rgba(0, 0, 0, 0.4)',
        },
        mirror: true,
        rangeselector: selectorOptions as any,
        rangeslider: { visible: true },
      },
      yaxis: {
        showgrid: true,
        zeroline: false,
        showline: false,
        showticklabels: true,
        linecolor: 'rgb(204,204,204)',
        linewidth: 0.5,
        ticks: 'outside',
        tickcolor: 'rgb(204,204,204)',
        tickwidth: 2,
        ticklen: 5,
        tickfont: {
          family: 'Ubuntu',
          color: 'rgba(0, 0, 0, 0.4)',
        },
        mirror: true,
        tickmode: 'array',
        tickvals: [0, 20, 40, 60, 80, 100],
        ticktext: ['0', '20', '40', '60', '80', '100'],
        range: [-10, 110],
      },
      cliponaxis: true,
      layer: 'below_traces',
      autosize: true,
      margin: {
        autoexpand: false,
        l: 60,
        r: 50,
        t: 30,
        b: 150,
      },
      font: {
        family: 'Ubuntu, monospace',
        color: 'rgba(0, 0, 0, 0.4)',
      },
      showlegend: true,
      legend: { orientation: 'h', y: -0.5 },
    };
    setPlotLayout(layout);
  };

  useEffect(() => {
    processData();
    processLayout();
  }, [currentGranularity]);

  return (
    <div style={{ alignContent: 'center', width: '100%' }}>
      <div className={classes.flexDisplay}>
        <div className={classes.adjust}>
          <Score
            score={edgeData.highScore}
            high
            color={edgeData.highColor}
            name={edgeData.highName}
          />
        </div>
        <Score
          score={edgeData.lowScore}
          high={false}
          color={edgeData.lowColor}
          name={edgeData.lowName}
        />
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
            value={currentGranularity.name}
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
      </div>
      <div className={classes.plot}>
        <Plot
          data={plotData}
          layout={plotLayout}
          useResizeHandler
          style={{
            width: '166.55%',
            height: 720,
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
            displayModeBar: false,
            toImageButtonOptions: {
              format: 'png',
              filename: 'ResilienceScores_Comparison',
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

export default ResilienceScoreComparisonPlot;
