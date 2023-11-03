import { useLazyQuery } from '@apollo/client';
import { useTheme } from '@material-ui/core';
import { LineAreaGraph } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { PROM_QUERY } from '../../../../../../../../graphql';
import {
  PanelDetails,
  ParsedMetricPrometheusData,
} from '../../../../../../../../models/dashboardsData';
import {
  PrometheusQueryVars,
  PrometheusResponse,
  promInput,
} from '../../../../../../../../models/graphql/prometheus';
import { MetricDataParserForPrometheus } from '../../../../../../../../utils/promUtils';
import useStyles from './styles';

interface GraphProps {
  prometheusQueryData: promInput;
  panelVars: PanelDetails;
}

const Graph: React.FC<GraphProps> = ({ prometheusQueryData, panelVars }) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const lineGraph: string[] = palette.graph.line;
  const areaGraph: string[] = palette.graph.area;
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [graphData, setGraphData] = React.useState<ParsedMetricPrometheusData>({
    seriesData: [],
    closedAreaData: [],
  });

  const [getGraphData] = useLazyQuery<PrometheusResponse, PrometheusQueryVars>(
    PROM_QUERY,
    {
      variables: {
        request: prometheusQueryData,
      },
      fetchPolicy: 'no-cache',
      onCompleted: (prometheusData) => {
        if (prometheusData) {
          const parsedData: ParsedMetricPrometheusData =
            MetricDataParserForPrometheus(
              prometheusData.getPrometheusData.metricsResponse ?? [],
              lineGraph,
              areaGraph,
              panelVars.promQueries
                .filter((query) => query.closeArea)
                .map((query) => query.queryID)
            );
          setGraphData(parsedData);
        }
      },
    }
  );

  useEffect(() => {
    if (
      firstLoad &&
      prometheusQueryData?.dsDetails.url !== '' &&
      prometheusQueryData?.queries?.length !== 0
    ) {
      getGraphData();
      setFirstLoad(false);
    }
  }, [firstLoad]);

  return (
    <div className={classes.graph}>
      <LineAreaGraph
        legendTableHeight={120}
        openSeries={graphData.seriesData}
        closedSeries={graphData.closedAreaData}
        showGrid={panelVars.panelOptions.grIDs}
        showPoints={panelVars.panelOptions.points}
        showLegendTable
        showTips
        unit={panelVars.unit}
        yLabel={panelVars.yAxisLeft}
        yLabelOffset={55}
        margin={{ left: 80, right: 20, top: 20, bottom: 30 }}
      />
    </div>
  );
};
export default Graph;
