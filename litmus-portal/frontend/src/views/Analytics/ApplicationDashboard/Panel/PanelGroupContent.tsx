import { Typography } from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import React from 'react';
import { Accordion } from '../../../../components/Accordion';
import { PanelResponse } from '../../../../models/graphql/dashboardsDetails';
import { ReactComponent as ExpandAccordion } from '../../../../svg/expandAccordion.svg';
import { ReactComponent as ShrinkAccordion } from '../../../../svg/shrinkAccordion.svg';
import GraphPanel from './GraphPanel';
import useStyles from './styles';

interface DashboardPanelGroupContentProps {
  panels: PanelResponse[];
  panel_group_name: string;
  panel_group_id: string;
  selectedPanels?: string[];
}

const DashboardPanelGroupContent: React.FC<DashboardPanelGroupContentProps> = ({
  panels,
  panel_group_id,
  panel_group_name,
  selectedPanels,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(true);

  return (
    <div className={classes.rootPanelGroup}>
      <Accordion expanded={open}>
        <AccordionSummary
          expandIcon={open ? <ShrinkAccordion /> : <ExpandAccordion />}
          aria-controls={`panel-group-${panel_group_id}-content`}
          id={`panel-group-${panel_group_id}-header`}
          className={classes.panelGroup}
          key={`${panel_group_id}`}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Typography className={classes.panelGroupTitle}>
            {panel_group_name}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.panelGroupContainer}>
          {panels &&
            panels
              .filter(
                (panel) =>
                  selectedPanels && selectedPanels.includes(panel.panel_id)
              )
              .map((panel: PanelResponse) => (
                <GraphPanel
                  key={panel.panel_id}
                  data-cy="dashboardPanel"
                  panel_id={panel.panel_id}
                  created_at={panel.created_at}
                  panel_name={panel.panel_name}
                  panel_options={panel.panel_options}
                  prom_queries={panel.prom_queries}
                  y_axis_left={panel.y_axis_left}
                  y_axis_right={panel.y_axis_right}
                  x_axis_down={panel.x_axis_down}
                  unit={panel.unit}
                  controllerPanelID={selectedPanels ? selectedPanels[0] : ''}
                />
              ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default DashboardPanelGroupContent;
