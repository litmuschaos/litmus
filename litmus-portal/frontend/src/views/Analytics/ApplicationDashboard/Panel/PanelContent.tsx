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
  PrometheusQueryVars,
  PrometheusResponse,
  promInput,
  promQueryInput,
} from '../../../../models/graphql/prometheus';
import {
  DEFAULT_REFRESH_RATE,
  DEFAULT_RELATIVE_TIME_RANGE,
  DEFAULT_TOLERANCE_LIMIT,
  MAX_REFRESH_RATE,
  MINIMUM_TOLERANCE_LIMIT,
  PROMETHEUS_ERROR_QUERY_RESOLUTION_LIMIT_REACHED,
} from '../../../../pages/ApplicationDashboard/constants';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import { RootState } from '../../../../redux/reducers';
import { ReactComponent as ViewChaosMetric } from '../../../../svg/aligment.svg';
import { ReactComponent as DisableViewChaosMetric } from '../../../../svg/alignmentStriked.svg';
import { ReactComponent as Expand } from '../../../../svg/arrowsOut.svg';
import { ReactComponent as Edit } from '../../../../svg/edit.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import {
  DataParserForPrometheus,
  getPromQueryInput,
} from '../../../../utils/promUtils';
import useStyles from './styles';

interface PrometheusQueryDataInterface {
  promInput: promInput;
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
  // get ProjectID
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);
  const lineGraph: string[] = palette.graph.line;
  const areaGraph: string[] = palette.graph.area;
  const [popOut, setPopOut] = useState(false);
  const [viewEventMetric, setViewEventMetric] = useState(false);
  const [
    prometheusQueryData,
    setPrometheusQueryData,
  ] = React.useState<PrometheusQueryDataInterface>({
    promInput: {
      ds_details: {
        url: '',
        start: '',
        end: '',
      },
      queries: [],
    },
    firstLoad: true,
  });

  const [graphData, setGraphData] = React.useState<ParsedPrometheusData>({
    seriesData: [],
    closedAreaData: [],
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
        ds_details: {
          url: '',
          start: '',
          end: '',
        },
        queries: [],
      },
    },
    fetchPolicy: 'no-cache',
    skip:
      prometheusQueryData?.promInput.queries?.length === 0 ||
      prometheusQueryData?.promInput.ds_details.url === '',
    onCompleted: (prometheusData) => {
      if (prometheusData) {
        const parsedData: ParsedPrometheusData = DataParserForPrometheus(
          prometheusData,
          lineGraph,
          areaGraph,
          prom_queries
            .filter((query) => query.close_area)
            .map((query) => query.queryid)
        );
        setGraphData(parsedData);
      }
      dashboard.selectDashboard({
        forceUpdate: false,
      });
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
    let promQueries: promQueryInput[] =
      prometheusQueryData.promInput.queries ?? [];
    if (prometheusQueryData.firstLoad) {
      const timeRangeDiff: number =
        new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
          1000 -
        new Date(moment(selectedDashboard.range.startDate).format()).getTime() /
          1000;
      promQueries = getPromQueryInput(prom_queries, timeRangeDiff, true);
    }
    setPrometheusQueryData({
      promInput: {
        ds_details: {
          url: selectedDataSource.selectedDataSourceURL,
          start: `${
            new Date(
              moment(selectedDashboard.range.startDate).format()
            ).getTime() / 1000
          }`,
          end: `${
            new Date(
              moment(selectedDashboard.range.endDate).format()
            ).getTime() / 1000
          }`,
        },
        queries: promQueries,
      },
      firstLoad: false,
    });
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
            className={classes.panelIconButton}
            onClick={() => {
              dashboard.selectDashboard({
                selectedDashboardID: selectedDashboard.selectedDashboardID,
                activePanelID: panel_id,
              });
              history.push({
                pathname: '/analytics/dashboard/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <Edit className={classes.panelIcon} />
          </IconButton>
          <ToolTip title={`${t('analyticsDashboard.toolTip.popout')}`}>
            <IconButton
              className={classes.panelIconButton}
              onClick={() => {
                setPopOut(true);
              }}
            >
              <Expand className={classes.panelIcon} />
            </IconButton>
          </ToolTip>
        </div>
      </div>
      <div>
        <Modal
          open={popOut}
          onClose={() => setPopOut(false)}
          disableBackdropClick
          disableEscapeKeyDown
          modalActions={
            <ButtonOutlined onClick={() => setPopOut(false)}>
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
              closedSeries={graphData.closedAreaData}
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
          closedSeries={graphData.closedAreaData}
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
