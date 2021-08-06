import { IconButton, Typography } from '@material-ui/core';
import { ButtonOutlined, LineAreaGraph, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ToolTip } from '../../../../components/ToolTip';
import { GraphPanelProps } from '../../../../models/dashboardsData';
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
import useStyles from './styles';

const DashboardPanel: React.FC<GraphPanelProps> = ({
  panel_id,
  panel_name,
  y_axis_left,
  panel_options,
  unit,
  className,
  centralBrushPosition,
  handleCentralBrushPosition,
  centralAllowGraphUpdate,
  metricDataForPanel,
  chaosData,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const [popOut, setPopOut] = useState(false);
  const [viewEventMetric, setViewEventMetric] = useState(false);

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
            <ButtonOutlined
              className={classes.closeButton}
              onClick={() => setPopOut(false)}
            >
              &#x2715;
            </ButtonOutlined>
          }
          height="95%"
          width="95%"
        >
          <div className={classes.popOutModal}>
            <Typography className={classes.title}>{panel_name}</Typography>
            <LineAreaGraph
              legendTableHeight={150}
              openSeries={metricDataForPanel?.seriesData}
              closedSeries={metricDataForPanel?.closedAreaData}
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
              margin={{ left: 75, right: 20, top: 20, bottom: 40 }}
            />
          </div>
        </Modal>
      </div>
      <div className={classes.singleGraph}>
        <LineAreaGraph
          centralAllowGraphUpdate={centralAllowGraphUpdate}
          centralBrushPosition={centralBrushPosition}
          handleCentralBrushPosition={handleCentralBrushPosition}
          legendTableHeight={120}
          openSeries={metricDataForPanel?.seriesData}
          closedSeries={metricDataForPanel?.closedAreaData}
          eventSeries={chaosData}
          showGrid={panel_options.grids}
          showPoints={panel_options.points}
          showEventTable={viewEventMetric}
          showLegendTable
          showTips
          showMultiToolTip
          showEventMarkers
          unit={unit}
          yLabel={y_axis_left}
          yLabelOffset={55}
          margin={{ left: 75, right: 20, top: 20, bottom: 30 }}
        />
      </div>
    </div>
  );
};
export default DashboardPanel;
