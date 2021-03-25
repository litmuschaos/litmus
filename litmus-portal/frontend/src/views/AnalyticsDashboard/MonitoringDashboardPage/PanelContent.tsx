/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { IconButton, Tooltip, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import { ButtonOutlined, GraphMetric, LineAreaGraph, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { PROM_QUERY } from '../../../graphql';
import { GraphPanelProps } from '../../../models/dashboardsData';
import {
  PrometheusQueryInput,
  PrometheusQueryVars,
  PrometheusResponse,
  promQueryInput,
} from '../../../models/graphql/prometheus';
import { RootState } from '../../../redux/reducers';
import { ReactComponent as ViewChaosMetric } from '../../../svg/aligment.svg';
import { ReactComponent as DisableViewChaosMetric } from '../../../svg/alignmentStriked.svg';
import { ReactComponent as Expand } from '../../../svg/arrowsOut.svg';
import { ReactComponent as Edit } from '../../../svg/edit.svg';
import {
  getPromQueryInput,
  seriesDataParserForPrometheus,
} from '../../../utils/promUtils';
import useStyles from './styles';

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  firstLoad: Boolean;
}

const PanelContent: React.FC<GraphPanelProps> = ({
  panel_id,
  panel_name,
  panel_options,
  prom_queries,
  y_axis_left,
  unit,
  chaos_data,
  className,
}) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();
  const lineGraph: string[] = palette.graph.line;
  const [popout, setPopout] = useState(false);
  const [viewEventMetric, setViewEventMetric] = useState(false);
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
    <div
      className={` ${classes.rootPanel} ${className} ${
        viewEventMetric ? classes.expand : ''
      }`}
    >
      <div>
        {/* <Typography>panel_id: {panel_id}</Typography>
          <Typography>
            panel_options: {JSON.stringify(panel_options)}
          </Typography>
          */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography className={classes.title}>{panel_name}</Typography>
          <div style={{ display: 'flex' }}>
            {viewEventMetric ? (
              <Tooltip
                title={`${t('analyticsDashboard.toolTip.hideChaosMetric')}`}
              >
                <IconButton
                  className={classes.pannelIconButton}
                  onClick={() => {
                    setViewEventMetric(false);
                  }}
                >
                  <DisableViewChaosMetric className={classes.pannelIcon} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip
                title={`${t('analyticsDashboard.toolTip.viewChaosMetric')}`}
              >
                <IconButton
                  className={classes.pannelIconButton}
                  onClick={() => {
                    setViewEventMetric(true);
                  }}
                >
                  <ViewChaosMetric className={classes.pannelIcon} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={`${t('analyticsDashboard.toolTip.editPanel')}`}>
              <IconButton
                disabled
                className={classes.pannelIconButton}
                onClick={() => {}}
              >
                <Edit className={classes.pannelIcon} />
              </IconButton>
            </Tooltip>
            <Tooltip title={`${t('analyticsDashboard.toolTip.popout')}`}>
              <IconButton
                className={classes.pannelIconButton}
                onClick={() => {
                  setPopout(true);
                }}
              >
                <Expand className={classes.pannelIcon} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div>
          <Modal
            open={popout}
            onClose={() => setPopout(false)}
            disableBackdropClick
            disableEscapeKeyDown
            modalActions={
              <ButtonOutlined onClick={() => setPopout(false)}>
                &#x2715;
              </ButtonOutlined>
            }
            height="95% !important"
            width="95%"
          >
            <div
              style={{
                width: '85%',
                height: '95%',
                padding: '2rem',
                paddingLeft: '10%',
              }}
            >
              <Typography className={classes.title}>{panel_name}</Typography>
              <LineAreaGraph
                legendTableHeight={120}
                openSeries={graphData}
                eventSeries={chaos_data}
                showPoints={false}
                showLegendTable
                showEventTable
                showTips
                showEventMarkers
                marginLeftEventTable={10}
                unit={unit}
                yLabel={y_axis_left}
                yLabelOffset={55}
                margin={{ left: 75, right: 20, top: 20, bottom: 10 }}
              />
            </div>
          </Modal>
        </div>
        <div className={classes.singleGraph}>
          <LineAreaGraph
            legendTableHeight={120}
            openSeries={graphData}
            eventSeries={chaos_data}
            showPoints={false}
            showEventTable={viewEventMetric}
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
