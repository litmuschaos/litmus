import { Typography } from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { PanelResponse } from '../../../models/graphql/dashboardsDetails';
import GraphPanel from './GraphPanel';
import useStyles, { Accordion } from './styles';

interface DashboardPanelGroupContentProps {
  panels: PanelResponse[];
  panel_group_name: string;
  panel_group_id: string;
}

const DashboardPanelGroupContent: React.FC<DashboardPanelGroupContentProps> = ({
  panels,
  panel_group_id,
  panel_group_name,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(true);

  return (
    <div className={classes.rootPanelGroup}>
      {/* <Typography>panel_group_id: {panel_group_id}</Typography> */}
      {/* <Typography>panel_group_name: {panel_group_name}</Typography> */}

      <div>
        <Accordion expanded={open}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
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
              panels.map((panel: PanelResponse) => (
                <div
                  key={panel.panel_id}
                  data-cy="dashboardPanel"
                  className={classes.panelDiv}
                >
                  <GraphPanel
                    panel_id={panel.panel_id}
                    panel_name={panel.panel_name}
                    panel_options={panel.panel_options}
                    prom_queries={panel.prom_queries}
                    y_axis_left={panel.y_axis_left}
                    y_axis_right={panel.y_axis_right}
                    x_axis_down={panel.x_axis_down}
                    unit={panel.unit}
                  />
                </div>
              ))}
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default DashboardPanelGroupContent;
