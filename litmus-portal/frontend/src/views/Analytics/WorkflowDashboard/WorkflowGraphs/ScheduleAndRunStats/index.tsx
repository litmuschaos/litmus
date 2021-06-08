import { useQuery } from '@apollo/client';
import { Paper, Tabs, useTheme } from '@material-ui/core';
import { LineAreaGraph } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyledTab, TabPanel } from '../../../../../components/Tabs';
import { SCHEDULED_WORKFLOW_STATS } from '../../../../../graphql';
import {
  DateValue,
  Filter,
  ScheduledWorkflowStatsResponse,
  ScheduledWorkflowStatsVars,
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

export interface GraphMetric {
  // Name of the GraphMetric
  metricName: string;

  // Array of {date and value}
  data: Array<DateValue>;

  // Color of the metric in the graph and legends
  baseColor?: string;
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };

  const [presentTime, setPresentTime] = useState<string>(
    `${Date.now() / 1000}`
  );

  const [graphDataState, setGraphDataState] = useState<DateValue[]>([]);

  useEffect(() => {
    setPresentTime(`${Date.now() / 1000}`);
  }, []);

  // const presentTime = `${Date.now() / 1000}`;
  let tempGraphData: Array<DateValue> = [];

  const { data: dateValueData, loading, error } = useQuery<
    ScheduledWorkflowStatsResponse,
    ScheduledWorkflowStatsVars
  >(SCHEDULED_WORKFLOW_STATS, {
    variables: {
      filter: filter,
      project_id: projectID,
      start_time: presentTime,
    },
    onCompleted: (dateValueData) => {
      console.log(dateValueData.getScheduledWorkflowStats);
      dateValueData.getScheduledWorkflowStats.map((data) => {
        tempGraphData.push({
          date: data.date,
          value: data.value,
        });
      });
      setGraphDataState(tempGraphData);
    },
  });

  const closedSeriesData: Array<GraphMetric> = [
    {
      metricName: 'schedules',
      data: graphDataState,
      baseColor: '#5B44BA',
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
              data-cy="activeTab"
              label="Schedule stats"
              {...tabProps(0)}
            />
            <StyledTab
              data-cy="receivedTab"
              label=" Run stats"
              {...tabProps(1)}
            />
          </Tabs>
          <TabPanel value={activeTab} index={0}>
            <div
              className={classes.graphContainer}
              // style={{
              //   width: '900px',
              //   height: '320px',
              //   marginLeft: '-70px',
              //   marginBottom: '25px',
              // }}
            >
              <LineAreaGraph
                closedSeries={closedSeriesData}
                showLegendTable={false}
                showPoints={true}
                showTips={true}
                showMultiToolTip
                yLabelOffset={35}
                xAxistimeFormat={xAxisTimeFormat(filter)}
              />
            </div>
          </TabPanel>
          <TabPanel value={activeTab} index={1} />
        </Paper>
      </Paper>
    </div>
  );
};
export default ScheduleAndRunStats;
