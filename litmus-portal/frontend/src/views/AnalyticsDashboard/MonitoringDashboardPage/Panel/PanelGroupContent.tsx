import { Typography, withStyles } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { EventMetric } from '../../../../models/dashboardsData';
import { PanelResponse } from '../../../../models/graphql/dashboardsDetails';
import GraphPanel from './GraphPanel';
import useStyles from './styles';

const Accordion = withStyles({
  root: {
    border: 0,
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
    '& .MuiAccordionSummary-root.Mui-expanded': {
      minHeight: '1rem !important',
      height: '2.5rem',
    },
    '& .MuiAccordionSummary-root': {
      minHeight: '1rem !important',
      height: '2.5rem',
    },
  },
})(MuiAccordion);

interface DashboardPanelGroupContentProps {
  panels: PanelResponse[];
  panel_group_name: string;
  panel_group_id: string;
  chaos_data?: Array<EventMetric>;
  selectedPanels?: string[];
}

const DashboardPanelGroupContent: React.FC<DashboardPanelGroupContentProps> = ({
  panels,
  panel_group_id,
  panel_group_name,
  chaos_data,
  selectedPanels,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(true);

  return (
    <div className={classes.rootPanelGroup}>
      <Accordion expanded={open}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
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
                  panel_name={panel.panel_name}
                  panel_options={panel.panel_options}
                  prom_queries={panel.prom_queries}
                  y_axis_left={panel.y_axis_left}
                  y_axis_right={panel.y_axis_right}
                  x_axis_down={panel.x_axis_down}
                  unit={panel.unit}
                  chaos_data={chaos_data}
                />
              ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default DashboardPanelGroupContent;
