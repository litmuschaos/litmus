import { Typography } from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import React from 'react';
import { Accordion } from '../../../../components/Accordion';
import {
  GraphPanelGroupProps,
  ParsedMetricPrometheusData,
} from '../../../../models/dashboardsData';
import { PanelResponse } from '../../../../models/graphql/dashboardsDetails';
import { ReactComponent as ExpandAccordion } from '../../../../svg/expandAccordion.svg';
import { ReactComponent as ShrinkAccordion } from '../../../../svg/shrinkAccordion.svg';
import DashboardPanel from './Panel';
import useStyles from './styles';

const DashboardPanelGroup: React.FC<GraphPanelGroupProps> = ({
  panels,
  panelGroupID,
  panelGroupName,
  selectedPanels,
  centralBrushPosition,
  handleCentralBrushPosition,
  centralAllowGraphUpdate,
  metricDataForGroup,
  chaosData,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(true);

  const getPanelMetricsData = (panelID: string) => {
    let filteredMetricsData: ParsedMetricPrometheusData = {
      seriesData: [],
      closedAreaData: [],
    };
    if (metricDataForGroup) {
      metricDataForGroup.forEach((panelMetrics) => {
        if (panelMetrics.panelID === panelID) {
          filteredMetricsData = panelMetrics.metricDataForPanel;
        }
      });
    }
    return filteredMetricsData;
  };

  return (
    <div className={classes.rootPanelGroup}>
      <Accordion expanded={open}>
        <AccordionSummary
          expandIcon={open ? <ShrinkAccordion /> : <ExpandAccordion />}
          aria-controls={`panel-group-${panelGroupID}-content`}
          id={`panel-group-${panelGroupID}-header`}
          className={classes.panelGroup}
          key={`${panelGroupID}`}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Typography className={classes.panelGroupTitle}>
            {panelGroupName}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.panelGroupContainer}>
          {panels &&
            panels
              .filter(
                (panel) =>
                  selectedPanels && selectedPanels.includes(panel.panelID)
              )
              .map(
                (panel: PanelResponse) =>
                  panel && (
                    <DashboardPanel
                      key={panel.panelID}
                      data-cy="dashboardPanel"
                      panelID={panel.panelID}
                      centralAllowGraphUpdate={centralAllowGraphUpdate}
                      centralBrushPosition={centralBrushPosition}
                      handleCentralBrushPosition={handleCentralBrushPosition}
                      createdAt={panel.createdAt}
                      panelName={panel.panelName}
                      panelOptions={panel.panelOptions}
                      yAxisLeft={panel.yAxisLeft}
                      yAxisRight={panel.yAxisRight}
                      xAxisDown={panel.xAxisDown}
                      unit={panel.unit}
                      promQueries={panel.promQueries}
                      metricDataForPanel={getPanelMetricsData(panel.panelID)}
                      chaosData={chaosData}
                    />
                  )
              )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default DashboardPanelGroup;
