import { IconButton, Typography } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import { ButtonOutlined, LineAreaGraph, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ToolTip } from '../../../../components/ToolTip';
import {
  GraphPanelProps,
  ParsedMetricPrometheusData,
} from '../../../../models/dashboardsData';
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
import { MetricDataParserForPrometheus } from '../../../../utils/promUtils';
import useStyles from './styles';

const DashboardPanel: React.FC<GraphPanelProps> = ({
  panel_id,
  panel_name,
  prom_queries,
  y_axis_left,
  panel_options,
  unit,
  className,
  selectedApplications,
  metricDataForPanel,
  chaosData,
}) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const lineGraph: string[] = palette.graph.line;
  const areaGraph: string[] = palette.graph.area;
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const closedAreaQueryIDs = prom_queries
    .filter((query) => query.close_area)
    .map((query) => query.queryid);
  const [popOut, setPopOut] = useState(false);
  const [viewEventMetric, setViewEventMetric] = useState(false);
  const [graphData, setGraphData] = React.useState<ParsedMetricPrometheusData>({
    seriesData: [],
    closedAreaData: [],
  });

  useEffect(
    () => () => {
      if (metricDataForPanel && metricDataForPanel.length > 0) {
        setGraphData(
          MetricDataParserForPrometheus(
            metricDataForPanel,
            lineGraph,
            areaGraph,
            closedAreaQueryIDs,
            selectedApplications
          )
        );
      }
    },
    [metricDataForPanel]
  );

  useEffect(() => {
    if (
      metricDataForPanel &&
      metricDataForPanel.length > 0 &&
      selectedApplications &&
      selectedApplications.length > 0
    ) {
      setGraphData(
        MetricDataParserForPrometheus(
          metricDataForPanel,
          lineGraph,
          areaGraph,
          closedAreaQueryIDs,
          selectedApplications
        )
      );
    }
  }, [selectedApplications]);

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
              eventSeries={chaosData}
              showGrid={panel_options.grids}
              showPoints={panel_options.points}
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
          openSeries={graphData.seriesData}
          closedSeries={graphData.closedAreaData}
          eventSeries={chaosData}
          showGrid={panel_options.grids}
          showPoints={panel_options.points}
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
  );
};
export default DashboardPanel;
