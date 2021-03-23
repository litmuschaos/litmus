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
import { seriesDataParserForPrometheus } from '../../../utils/promUtils';
import useStyles from './styles';

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
  unit,
  chaos_data,
}) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const lineGraph: string[] = palette.graph.line;

  const [
    prometheusQueryData,
    setPrometheusQueryData,
  ] = React.useState<PrometheusQueryInput>({
    url: '',
    start: '',
    end: '',
    queries: [],
  });

  const [graphData, setGraphData] = React.useState<Array<GraphMetric>>([]);

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
    variables: { prometheusInput: prometheusQueryData },
    fetchPolicy: 'no-cache',
  });

  const generatePrometheusQueryData = () => {
    let promQueries: promQueryInput[] = [];
    prom_queries.forEach((query: PromQuery) => {
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
    setPrometheusQueryData(prometheusQueryInput);
    promQueries = [];
  };

  const updateGraphData = () => {
    let seriesData: Array<GraphMetric> = [];
    if (prometheusData) {
      seriesData = seriesDataParserForPrometheus(prometheusData, lineGraph);
      setGraphData(seriesData);
      seriesData = [];
    }
  };

  useEffect(() => {
    if (
      synchronizer.firstLoad === true &&
      synchronizer.updateQueries === false
    ) {
      if (prom_queries.length) {
        generatePrometheusQueryData();
        setSynchronizer({
          updateQueries: true,
          firstLoad: false,
          fetch: true,
        });
      }
    }
    if (
      synchronizer.updateQueries === true &&
      synchronizer.firstLoad === false
    ) {
      setTimeout(() => {
        if (prom_queries.length) {
          generatePrometheusQueryData();
          setSynchronizer({
            ...synchronizer,
            fetch: true,
          });
        }
      }, selectedDashboard.refreshRate);
    }
  }, [prometheusQueryData]);

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
          <Typography>
            panel_options: {JSON.stringify(panel_options)}
          </Typography>
          */}
        <Typography className={classes.title}>{panel_name}</Typography>
        <div className={classes.singleGraph}>
          <LineAreaGraph
            legendTableHeight={120}
            openSeries={graphData}
            eventSeries={chaos_data}
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
      </div>
    </div>
  );
};
export default PanelContent;
