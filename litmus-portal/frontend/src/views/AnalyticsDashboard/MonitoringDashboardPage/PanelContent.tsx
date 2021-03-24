/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import { GraphMetric, LineAreaGraph } from 'litmus-ui';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PROM_QUERY } from '../../../graphql';
import { PanelResponse } from '../../../models/graphql/dashboardsDetails';
import {
  PrometheusQueryInput,
  PrometheusQueryVars,
  PrometheusResponse,
  promQueryInput,
} from '../../../models/graphql/prometheus';
import { RootState } from '../../../redux/reducers';
import {
  getPromQueryInput,
  seriesDataParserForPrometheus,
} from '../../../utils/promUtils';
import useStyles from './styles';

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  firstLoad: Boolean;
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
  ] = React.useState<PrometheusQueryDataInterface>({
    promInput: {
      url: '',
      start: '',
      end: '',
      queries: [],
    },
    firstLoad: true,
  });

  const [graphData, setGraphData] = React.useState<Array<GraphMetric>>([]);

  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const selectedDataSource = useSelector(
    (state: RootState) => state.selectDataSource
  );

  // Apollo query to get the prometheus data
  useQuery<PrometheusResponse, PrometheusQueryVars>(PROM_QUERY, {
    variables: {
      prometheusInput: prometheusQueryData?.promInput ?? {
        url: '',
        start: '',
        end: '',
        queries: [],
      },
    },
    fetchPolicy: 'no-cache',
    skip:
      prometheusQueryData?.promInput.queries?.length === 0 ||
      prometheusQueryData?.promInput.url === '',
    onCompleted: (prometheusData) => {
      let seriesData: Array<GraphMetric> = [];
      if (prometheusData) {
        seriesData = seriesDataParserForPrometheus(prometheusData, lineGraph);
        setGraphData(seriesData);
        seriesData = [];
      }
    },
  });

  const generatePromQueries = () => {
    let promQueries: promQueryInput[] = prometheusQueryData.promInput.queries;
    if (prometheusQueryData.firstLoad) {
      promQueries = getPromQueryInput(prom_queries);
    }
    setPrometheusQueryData({
      promInput: {
        url: selectedDataSource.selectedDataSourceURL,
        start: `${Math.round(new Date().getTime() / 1000) - 1800}`,
        end: `${Math.round(new Date().getTime() / 1000)}`,
        queries: promQueries,
      },
      firstLoad: false,
    });
    promQueries = [];
  };

  useEffect(() => {
    setTimeout(() => {
      generatePromQueries();
    }, selectedDashboard.refreshRate);
  }, [prometheusQueryData]);

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
