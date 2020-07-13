/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

type GraphState = {
  x: any[];
  y: any[];
  y2: any[];
};

interface CommunityAnalyticsPlotProps {
  OperatorData?: any;
  ExperimentData?: any;
}

class CommunityAnalyticsPlotCumulative extends Component<
  CommunityAnalyticsPlotProps,
  GraphState
> {
  constructor(props: Readonly<CommunityAnalyticsPlotProps>) {
    super(props);
    this.state = {
      x: [],
      y: [],
      y2: [],
    };
    this.processData = this.processData.bind(this);
  }

  componentDidMount() {
    this.processData();
  }

  processData() {
    const OperatorCumulative: string[] = [];
    const ExperimentCumulative: string[] = [];
    const { OperatorData, ExperimentData } = this.props;
    OperatorData.forEach((element: any, index: any) => {
      OperatorCumulative.push(element.count);
      ExperimentCumulative.push(ExperimentData[index].count);
    });

    const cumulativeSum = ((sum: any) => (value: any) =>
      (sum = parseInt(sum, 10) + parseInt(value, 10)))(0);

    const operatorCumulative = OperatorCumulative.map(cumulativeSum);
    const experimentCumulative = ExperimentCumulative.map(cumulativeSum);

    const rawData: any = [];

    OperatorData.forEach((element: any, index: any) => {
      rawData.push({
        date: element.date,
        operatorInstalls: operatorCumulative[index],
        experimentRuns: experimentCumulative[index],
      });
    });

    const x: Date[] = [];
    const y: string[] = [];
    const y2: string[] = [];
    rawData.forEach(function dateSplit(datum: any) {
      const splits = datum.date.split('-');
      x.push(
        new Date(splits[0] as any, (splits[1] as any) - 1, splits[2] as any)
      );
      y.push(datum.operatorInstalls);
      y2.push(datum.experimentRuns);
    });
    this.setState({ x });
    this.setState({ y });
    this.setState({ y2 });
  }

  render() {
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

    const { x } = this.state;

    const { y } = this.state;

    const { y2 } = this.state;

    return (
      <Plot
        data={[
          {
            type: 'scatter',
            x,
            y,
            mode: 'lines',
            name: 'operatorInstalls',
            line: { color: '#109B67' },
          },
          {
            type: 'scatter',
            x,
            y: y2,
            mode: 'lines',
            name: 'experimentRuns',
            yaxis: 'y2',
            line: { color: '#858CDD' },
          },
        ]}
        layout={{
          autosize: true,
          width: 640,
          height: 400,
          title: 'Growth',
          xaxis: {
            rangeselector: selectorOptions as any,
            rangeslider: { visible: true },
          },
          yaxis: {
            tickcolor: 'white',
            tickfont: {
              color: 'white',
            },
            showgrid: false,
          },
          yaxis2: {
            overlaying: 'y',
          },
        }}
        useResizeHandler
        style={{
          width: '100%',
          height: '100%',
        }}
        config={{
          displaylogo: false,
          autosizable: true,
          responsive: true,
          frameMargins: 0.2,
          showAxisDragHandles: true,
          showAxisRangeEntryBoxes: true,
          showTips: true,
          displayModeBar: 'hover',
          toImageButtonOptions: {
            format: 'png',
            filename: 'Litmus_Community_Stats',
            width: 1920,
            height: 1080,
            scale: 2,
          },
        }}
      />
    );
  }
}
export default CommunityAnalyticsPlotCumulative;
