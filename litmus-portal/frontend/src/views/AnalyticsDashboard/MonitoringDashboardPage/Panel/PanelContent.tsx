import { ApolloError, useQuery } from '@apollo/client';
import { IconButton, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import { ButtonOutlined, LineAreaGraph, Modal } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ToolTip } from '../../../../components/ToolTip';
import { PROM_QUERY } from '../../../../graphql';
import {
  GraphPanelProps,
  ParsedPrometheusData,
} from '../../../../models/dashboardsData';
import {
  PrometheusQueryInput,
  PrometheusQueryVars,
  PrometheusResponse,
  promQueryInput,
} from '../../../../models/graphql/prometheus';
import {
  DEFAULT_REFRESH_RATE,
  DEFAULT_RELATIVE_TIME_RANGE,
  DEFAULT_TOLERANCE_LIMIT,
  MAX_REFRESH_RATE,
  MINIMUM_TOLERANCE_LIMIT,
  PROMETHEUS_ERROR_QUERY_RESOLUTION_LIMIT_REACHED,
} from '../../../../pages/MonitoringDashboardPage/constants';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { RootState } from '../../../../redux/reducers';
import { ReactComponent as ViewChaosMetric } from '../../../../svg/aligment.svg';
import { ReactComponent as DisableViewChaosMetric } from '../../../../svg/alignmentStriked.svg';
import { ReactComponent as Expand } from '../../../../svg/arrowsOut.svg';
import { ReactComponent as Edit } from '../../../../svg/edit.svg';
import {
  DataParserForPrometheus,
  getPromQueryInput,
} from '../../../../utils/promUtils';
import useStyles from './styles';

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  firstLoad: Boolean;
}

const PanelContent: React.FC<GraphPanelProps> = ({
  panel_id,
  panel_name,
  prom_queries,
  y_axis_left,
  unit,
  className,
  controllerPanelID,
}) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const lineGraph: string[] = palette.graph.line;
  const areaGraph: string[] = palette.graph.area;
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

  const [graphData, setGraphData] = React.useState<ParsedPrometheusData>({
    seriesData: [],
    chaosData: [],
  });

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
      if (prometheusData) {
        let parsedData: ParsedPrometheusData = DataParserForPrometheus(
          prometheusData,
          lineGraph,
          areaGraph
        );
        setGraphData(parsedData);
        parsedData = {
          seriesData: [],
          chaosData: [],
        };
      }
    },
    onError: (error: ApolloError) => {
      if (error.message === PROMETHEUS_ERROR_QUERY_RESOLUTION_LIMIT_REACHED) {
        if (selectedDashboard.refreshRate !== MAX_REFRESH_RATE) {
          dashboard.selectDashboard({
            refreshRate: MAX_REFRESH_RATE,
          });
        }
        setPrometheusQueryData({ ...prometheusQueryData, firstLoad: true });
      }
    },
  });

  const generatePromQueries = () => {
    let promQueries: promQueryInput[] = prometheusQueryData.promInput.queries;
    if (prometheusQueryData.firstLoad) {
      const timeRangeDiff: number =
        new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
          1000 -
        new Date(moment(selectedDashboard.range.startDate).format()).getTime() /
          1000;
      promQueries = getPromQueryInput(prom_queries, timeRangeDiff);
    }
    setPrometheusQueryData({
      promInput: {
        url: selectedDataSource.selectedDataSourceURL,
        start: `${
          new Date(
            moment(selectedDashboard.range.startDate).format()
          ).getTime() / 1000
        }`,
        end: `${
          new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
          1000
        }`,
        queries: promQueries,
      },
      firstLoad: false,
    });
    promQueries = [];
  };

  useEffect(() => {
    if (prometheusQueryData.firstLoad) {
      generatePromQueries();
      if (
        selectedDashboard.refreshRate !== MAX_REFRESH_RATE &&
        panel_id === controllerPanelID
      ) {
        dashboard.selectDashboard({
          range: {
            startDate: moment
              .unix(
                Math.round(new Date().getTime() / 1000) -
                  DEFAULT_RELATIVE_TIME_RANGE
              )
              .format(),
            endDate: moment
              .unix(Math.round(new Date().getTime() / 1000))
              .format(),
          },
        });
      }
    }
    if (!prometheusQueryData.firstLoad) {
      if (panel_id === controllerPanelID) {
        const endDate: number =
          new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
          1000;
        const now: number = Math.round(new Date().getTime() / 1000);
        const diff: number = Math.abs(now - endDate);
        const maxLim: number =
          (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
            ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
              MINIMUM_TOLERANCE_LIMIT
            : DEFAULT_TOLERANCE_LIMIT;
        if (
          diff >= 0 &&
          diff <= maxLim &&
          selectedDashboard.refreshRate !== MAX_REFRESH_RATE
        ) {
          const startDate: number =
            new Date(
              moment(selectedDashboard.range.startDate).format()
            ).getTime() / 1000;
          const interval: number = endDate - startDate;
          dashboard.selectDashboard({
            range: {
              startDate: moment
                .unix(Math.round(new Date().getTime() / 1000) - interval)
                .format(),
              endDate: moment
                .unix(Math.round(new Date().getTime() / 1000))
                .format(),
            },
          });
        }
      }
      setTimeout(
        () => {
          generatePromQueries();
        },
        selectedDashboard.refreshRate !== 0
          ? selectedDashboard.refreshRate
          : DEFAULT_REFRESH_RATE
      );
    }
  }, [prometheusQueryData]);

  useEffect(() => {
    const endDate: number =
      new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
      1000;
    const now: number = Math.round(new Date().getTime() / 1000);
    const diff: number = Math.abs(now - endDate);
    const maxLim: number =
      (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
        ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
          MINIMUM_TOLERANCE_LIMIT
        : DEFAULT_TOLERANCE_LIMIT;
    if (
      !(diff >= 0 && diff <= maxLim) &&
      selectedDashboard.refreshRate !== MAX_REFRESH_RATE
    ) {
      setPrometheusQueryData({ ...prometheusQueryData, firstLoad: true });
      dashboard.selectDashboard({
        refreshRate: MAX_REFRESH_RATE,
      });
    }
    if (
      diff >= 0 &&
      diff <= maxLim &&
      selectedDashboard.refreshRate === MAX_REFRESH_RATE
    ) {
      setPrometheusQueryData({ ...prometheusQueryData, firstLoad: true });
    }
  }, [selectedDashboard.range]);

  useEffect(() => {
    if (selectedDashboard.forceUpdate) {
      setPrometheusQueryData({ ...prometheusQueryData, firstLoad: true });
    }
  }, [selectedDashboard.forceUpdate]);

  return (
    <div
      className={` ${classes.rootPanel} ${className} ${
        viewEventMetric ? classes.expand : ''
      }`}
    >
      <div className={classes.wrapperParentIconsTitle}>
        <Typography className={classes.title}>{panel_name}</Typography>
        <div className={classes.wrapperIcons}>
          {viewEventMetric ? (
            <ToolTip
              title={`${t('analyticsDashboard.toolTip.hideChaosMetric')}`}
            >
              <IconButton
                className={classes.panelIconButton}
                onClick={() => {
                  setViewEventMetric(false);
                }}
              >
                <DisableViewChaosMetric className={classes.panelIcon} />
              </IconButton>
            </ToolTip>
          ) : (
            <ToolTip
              title={`${t('analyticsDashboard.toolTip.viewChaosMetric')}`}
            >
              <IconButton
                className={classes.panelIconButton}
                onClick={() => {
                  setViewEventMetric(true);
                }}
              >
                <ViewChaosMetric className={classes.panelIcon} />
              </IconButton>
            </ToolTip>
          )}
          <IconButton
            disabled
            className={classes.panelIconButton}
            onClick={() => {}}
          >
            <Edit className={classes.panelIcon} />
          </IconButton>
          <ToolTip title={`${t('analyticsDashboard.toolTip.popout')}`}>
            <IconButton
              className={classes.panelIconButton}
              onClick={() => {
                setPopout(true);
              }}
            >
              <Expand className={classes.panelIcon} />
            </IconButton>
          </ToolTip>
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
          <div className={classes.popOutModal}>
            <Typography className={classes.title}>{panel_name}</Typography>
            <LineAreaGraph
              legendTableHeight={120}
              openSeries={graphData.seriesData}
              eventSeries={graphData.chaosData}
              showPoints={false}
              showLegendTable
              showEventTable
              showTips={false}
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
          openSeries={graphData.seriesData}
          eventSeries={graphData.chaosData}
          showPoints={false}
          showEventTable={viewEventMetric}
          showLegendTable
          showTips={false}
          showEventMarkers
          unit={unit}
          yLabel={y_axis_left}
          yLabelOffset={55}
          margin={{ left: 75, right: 20, top: 20, bottom: 10 }}
        />
      </div>
    </div>
  );
};
export default PanelContent;
