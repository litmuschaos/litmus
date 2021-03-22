/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import { GraphMetric, LineAreaGraph } from 'litmus-ui';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PROM_QUERY } from '../../../graphql';
import {
  PanelResponse,
  PromQuery,
} from '../../../models/graphql/dashboardsDetails';
import {
  PrometheusQueryInput,
  PrometheusQueryVars,
  PrometheusResponse,
  promQueryInput,
} from '../../../models/graphql/prometheus';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  chaosInput: string[];
}

interface GraphDataInterface {
  seriesData: Array<GraphMetric>;
  eventData: Array<GraphMetric>;
}

interface SynchronizerInterface {
  updateQueries: Boolean;
  firstLoad: Boolean;
  fetch: Boolean;
}

const PanelContent: React.FC<PanelResponse> = ({
  panel_id,
  panel_name,
  panel_options,
  prom_queries,
  y_axis_left,
  y_axis_right,
  x_axis_down,
  unit,
}) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const lineGraph: string[] = palette.graph.line;

  const [
    prometheusQueryData,
    setPrometheusQueryData,
  ] = React.useState<PrometheusQueryDataInterface>({
    promInput: {
      url: '',
      start: '',
      end: '',
      queries: [],
    },
    chaosInput: [],
  });

  const [graphData, setGraphData] = React.useState<GraphDataInterface>({
    seriesData: [],
    eventData: [],
  });

  const [synchronizer, setSynchronizer] = React.useState<SynchronizerInterface>(
    {
      updateQueries: false,
      firstLoad: true,
      fetch: false,
    }
  );

  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const selectedDataSource = useSelector(
    (state: RootState) => state.selectDataSource
  );

  // Apollo query to get the prometheus data
  const { data: prometheusData } = useQuery<
    PrometheusResponse,
    PrometheusQueryVars
  >(PROM_QUERY, {
    variables: { prometheusInput: prometheusQueryData.promInput },
    fetchPolicy: 'no-cache',
  });

  const generatePrometheusQueryData = () => {
    let promQueries: promQueryInput[] = [];
    let chaosQueries: string[] = [];
    prom_queries.forEach((query: PromQuery) => {
      if (query.prom_query_name.startsWith('litmuschaos_awaited_experiments')) {
        chaosQueries.push(query.queryid);
      }
      promQueries.push({
        queryid: query.queryid,
        query: query.prom_query_name,
        legend: query.legend,
        resolution: query.resolution,
        minstep: parseInt(query.minstep, 10),
      });
    });
    const prometheusQueryInput: PrometheusQueryInput = {
      url: selectedDataSource.selectedDataSourceURL,
      start: `${Math.round(new Date().getTime() / 1000) - 1800}`,
      end: `${Math.round(new Date().getTime() / 1000)}`,
      queries: promQueries,
    };
    setPrometheusQueryData({
      promInput: prometheusQueryInput,
      chaosInput: chaosQueries,
    });
    promQueries = [];
    chaosQueries = [];
  };

  const updateGraphData = () => {
    let seriesData: Array<GraphMetric> = [];
    let eventData: Array<GraphMetric> = [];
    if (prometheusData) {
      prometheusData.GetPromQuery.forEach((queryResponse) => {
        if (prometheusQueryData.chaosInput.includes(queryResponse.queryid)) {
          if (queryResponse.legends && queryResponse.legends[0]) {
            eventData.push(
              ...queryResponse.legends.map((elem, index) => ({
                metricName: elem[0] ?? 'chaos',
                data: queryResponse.tsvs[index].map((dataPoint) => ({
                  date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
                  value: parseInt(dataPoint.value ?? '0', 10),
                })),
                baseColor: palette.error.main,
              }))
            );
          }
        } else if (queryResponse.legends && queryResponse.legends[0]) {
          seriesData.push(
            ...queryResponse.legends.map((elem, index) => ({
              metricName: elem[0] ?? 'metric',
              data: queryResponse.tsvs[index].map((dataPoint) => ({
                date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
                value: parseFloat(dataPoint.value ?? '0.0'),
              })),
              baseColor: lineGraph[index % lineGraph.length],
            }))
          );
        }
      });
      setGraphData({
        seriesData,
        eventData,
      });
      seriesData = [];
      eventData = [];
    }
  };

  // useEffect(() => {
  //   if (
  //     synchronizer.firstLoad === true &&
  //     synchronizer.updateQueries === false
  //   ) {
  //     if (prom_queries.length) {
  //       generatePrometheusQueryData();
  //       setSynchronizer({
  //         updateQueries: true,
  //         firstLoad: false,
  //         fetch: true,
  //       });
  //     }
  //   }
  //   if (
  //     synchronizer.updateQueries === true &&
  //     synchronizer.firstLoad === false
  //   ) {
  //     setTimeout(() => {
  //       if (prom_queries.length) {
  //         generatePrometheusQueryData();
  //         setSynchronizer({
  //           ...synchronizer,
  //           fetch: true,
  //         });
  //       }
  //     }, selectedDashboard.refreshRate);
  //   }
  // }, [prometheusQueryData]);

  useEffect(() => {
    if (
      prometheusData &&
      prometheusData.GetPromQuery.length &&
      prometheusData.GetPromQuery[0].legends?.length &&
      prometheusData.GetPromQuery[0].legends !== null &&
      prometheusData.GetPromQuery[0].legends[0] !== null
    ) {
      if (synchronizer.fetch === true) {
        updateGraphData();
        setSynchronizer({
          ...synchronizer,
          fetch: false,
        });
      }
    }
  }, [prometheusData]);

  return (
    <div className={classes.rootPanel}>
      <div>
        {/* <Typography>panel_id: {panel_id}</Typography>
          <Typography>panel_name: {panel_name}</Typography>
          <Typography>
            panel_options: {JSON.stringify(panel_options)}
          </Typography>
          <Typography>
            panel_axes {y_axis_left}, {y_axis_right}, {x_axis_down}
          </Typography>
          <Typography>
            panel_unit: {unit}
          </Typography>
          <Typography>prom_queries: {JSON.stringify(prom_queries)}</Typography>
          <Typography>
            data_for_graph: {JSON.stringify(prometheusData)}
          </Typography> */}
        <Typography className={classes.title}>{panel_name}</Typography>
        {/* <Typography
          style={{ display: 'none' }}
        >{`${panel_id}-${panel_options.grids}`}</Typography> */}
        {/* panel_id and panel_options has been used temporaryly will be removed later */}
        <div className={classes.singleGraph}>
          <LineAreaGraph
            legendTableHeight={120}
            openSeries={graphData.seriesData}
            eventSeries={graphData.eventData}
            showPoints={false}
            showLegendTable
            showTips
            showEventMarkers
            unit={unit}
            yLabel={y_axis_left}
            yLabelOffset={55}
            margin={{ left: 75, right: 20, top: 20, bottom: 10 }}
          />
        </div>
        {/* <Typography>
          data_for_graph: {JSON.stringify(prometheusData)}
        </Typography> */}
      </div>
    </div>
  );
};
export default PanelContent;
