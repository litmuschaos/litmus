import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import OverviewChartsWithToggle, { ChartType } from '@components/OverviewChartsWithToggle';

interface ProbeStatusGraphProps {
  data: [number[], number[]];
}

function ProbeStatusGraph({ data }: ProbeStatusGraphProps): JSX.Element {
  const { getString } = useStrings();
  const [graphType, setGraphType] = React.useState<ChartType>(ChartType.BAR);

  return (
    <OverviewChartsWithToggle
      updateSelectedView={type => setGraphType(type)}
      data={[
        {
          name: `Passed (${data[0].reduce((a, b) => a + b, 0)})`,
          data: data[0],
          color: '#42AB45'
        },
        {
          name: `Failed (${data[1].reduce((a, b) => a + b, 0)})`,
          data: data[1],
          color: '#DA291D'
        }
      ]}
      customChartOptions={{
        chart: {
          height: 225
        },
        series: [
          {
            type: (graphType === ChartType.BAR ? 'column' : 'line') as 'column' | 'line'
          },
          {
            type: (graphType === ChartType.BAR ? 'column' : 'line') as 'column' | 'line'
          }
        ],
        plotOptions: {
          column: {
            groupPadding: 0.2,
            grouping: true
          }
        },
        tooltip: {
          useHTML: true,
          outside: true,
          borderColor: 'black',
          formatter: function () {
            return (
              'Run#: <strong>' +
              (this.x + 1) +
              '</strong>' +
              '<br/>' +
              'Passed' +
              ': ' +
              data[0][this.x] +
              '<br/>' +
              'Failed' +
              ': ' +
              data[1][this.x] +
              '<br/>'
            );
          }
        },
        yAxis: {
          title: {
            text: getString('probes')
          }
        },
        xAxis: {
          title: {
            text: getString('runs')
          }
        }
      }}
    />
  );
}

export default withErrorBoundary(ProbeStatusGraph, { FallbackComponent: Fallback });
