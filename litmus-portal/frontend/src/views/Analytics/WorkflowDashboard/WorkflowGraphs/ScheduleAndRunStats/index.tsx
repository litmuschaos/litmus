import { useQuery } from '@apollo/client';
import { Paper, Tabs, useTheme } from '@material-ui/core';
import { GraphMetric, LineAreaGraph } from 'litmus-ui';
import React, { useState } from 'react';
import { StyledTab, TabPanel } from '../../../../../components/Tabs';
import { WORKFLOW_STATS } from '../../../../../graphql';
import {
  DateValue,
  Filter,
  WorkflowStatsResponse,
  WorkflowStatsVars,
} from '../../../../../models/graphql/scheduleData';
import { getProjectID } from '../../../../../utils/getSearchParams';
import useStyles from './style';

// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface ScheduleAndRunStatsProps {
  filter: Filter;
}

const ScheduleAndRunStats: React.FC<ScheduleAndRunStatsProps> = ({
  filter,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };

  const [graphDataState, setGraphDataState] = useState<DateValue[]>([]);

  const tempGraphData: Array<DateValue> = [];

  useQuery<WorkflowStatsResponse, WorkflowStatsVars>(WORKFLOW_STATS, {
    variables: {
      filter,
      project_id: projectID,
      show_workflow_runs: activeTab === 0,
    },
    onCompleted: (dateValueData) => {
      dateValueData.getScheduledWorkflowStats.map((data) =>
        tempGraphData.push({
          date: data.date,
          value: data.value,
        })
      );
      setGraphDataState(tempGraphData);
    },
  });

  const closedSeriesData: Array<GraphMetric> = [
    {
      metricName: activeTab === 0 ? 'Runs' : 'Schedules',
      data: graphDataState,
      baseColor: activeTab === 0 ? '#F6793E' : '#5B44BA',
    },
  ];

  function xAxisTimeFormat(filter: Filter) {
    switch (filter) {
      case Filter.monthly:
        return 'MMM';
      case Filter.weekly:
        return '[W] W';
      case Filter.hourly:
        return 'HH[hrs]';
      default:
        return 'MMM';
    }
  }

  return (
    <div>
      <Paper elevation={0}>
        <Paper className={classes.workflowGraphs}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            TabIndicatorProps={{
              style: {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <StyledTab
              data-cy="receivedTab"
              label=" Run stats"
              {...tabProps(1)}
            />
            <StyledTab
              data-cy="activeTab"
              label="Schedule stats"
              {...tabProps(0)}
            />
          </Tabs>
          <TabPanel value={activeTab} index={0}>
            <div className={classes.graphContainer}>
              <LineAreaGraph
                closedSeries={closedSeriesData}
                showLegendTable={false}
                showPoints
                showTips
                showMultiToolTip
                yLabelOffset={35}
                xAxistimeFormat={xAxisTimeFormat(filter)}
              />
            </div>
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <div className={classes.graphContainer}>
              <LineAreaGraph
                closedSeries={closedSeriesData}
                showLegendTable={false}
                showPoints
                showTips
                showMultiToolTip
                yLabelOffset={35}
                xAxistimeFormat={xAxisTimeFormat(filter)}
              />
            </div>
          </TabPanel>
        </Paper>
      </Paper>
    </div>
  );
};
export default ScheduleAndRunStats;
