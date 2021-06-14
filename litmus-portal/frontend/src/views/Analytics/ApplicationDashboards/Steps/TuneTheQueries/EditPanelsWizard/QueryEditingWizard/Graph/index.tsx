import { useLazyQuery } from '@apollo/client';
import { useTheme } from '@material-ui/core';
import { LineAreaGraph } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { PROM_QUERY } from '../../../../../../../../graphql';
import {
  PanelDetails,
  ParsedPrometheusData,
} from '../../../../../../../../models/dashboardsData';
import {
  PrometheusQueryVars,
  PrometheusResponse,
  promInput,
} from '../../../../../../../../models/graphql/prometheus';
import { DataParserForPrometheus } from '../../../../../../../../utils/promUtils';
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
  const [graphData, setGraphData] = React.useState<ParsedPrometheusData>({
    seriesData: [],
    closedAreaData: [],
    chaosData: [],
  });

  const [getGraphData] = useLazyQuery<PrometheusResponse, PrometheusQueryVars>(
    PROM_QUERY,
    {
      variables: {
        prometheusInput: prometheusQueryData,
      },
      fetchPolicy: 'no-cache',
      onCompleted: (prometheusData) => {
        if (prometheusData) {
          const parsedData: ParsedPrometheusData = DataParserForPrometheus(
            prometheusData,
            lineGraph,
            areaGraph,
            panelVars.prom_queries
              .filter((query) => query.close_area)
              .map((query) => query.queryid)
          );
          setGraphData(parsedData);
        }
      },
    }
  );

  useEffect(() => {
    if (
      firstLoad &&
      prometheusQueryData?.ds_details.url !== '' &&
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
        showGrid={panelVars.panel_options.grids}
        showPoints={panelVars.panel_options.points}
        showLegendTable
        showTips={false}
        unit={panelVars.unit}
        yLabel={panelVars.y_axis_left}
        yLabelOffset={55}
        margin={{ left: 80, right: 20, top: 20, bottom: 10 }}
      />
    </div>
  );
};
export default Graph;
