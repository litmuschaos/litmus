import React, { useMemo } from 'react';
import Highcharts, { SeriesColumnOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { merge } from 'lodash-es';

type DataType = Omit<SeriesColumnOptions, 'type'>[];

export interface StackedColumnChartProps {
  data: DataType;
  options?: Highcharts.Options;
}

const getDefaultOptions = (data: DataType): Highcharts.Options => ({
  chart: {
    type: 'column',
    spacing: [25, 25, 25, 25]
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    labels: {
      formatter: function () {
        return `${this.pos + 1}`;
      },

      style: {
        fontSize: 'var(--font-size-xsmall)',
        color: 'var(--grey-400)'
      }
    },
    tickInterval: 1,
    tickLength: 0
  },
  yAxis: {
    title: {
      text: null
    },
    gridLineWidth: 1,
    gridLineColor: 'var(--grey-200)',
    labels: {
      style: {
        fontSize: 'var(--font-size-xsmall)',
        color: 'var(--grey-400)'
      }
    }
  },
  plotOptions: {
    column: {
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 10,
      stacking: 'normal',
      animation: false,
      events: {
        legendItemClick: function () {
          return false;
        }
      }
    }
  },
  legend: {
    maxHeight: 80,
    itemStyle: {
      color: 'var(--grey-500)',
      fontSize: 'var(--font-size-small)',
      fontWeight: '500',
      textOverflow: 'ellipsis'
    }
  },
  series: data as SeriesColumnOptions[]
});

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options);

const StackedColumnChart: React.FC<StackedColumnChartProps> = props => {
  const { data, options = {} } = props;
  const defaultOptions = useMemo(() => getDefaultOptions(data), [data]);
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options]);
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />;
};

export default StackedColumnChart;
