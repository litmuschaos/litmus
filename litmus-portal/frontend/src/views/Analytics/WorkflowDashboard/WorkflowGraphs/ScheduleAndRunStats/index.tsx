import { useQuery } from '@apollo/client';
import { Paper, Tabs, useTheme } from '@material-ui/core';
import { GraphMetric, LineAreaGraph } from 'litmus-ui';
import React from 'react';
import Loader from '../../../../../components/Loader';
import { StyledTab } from '../../../../../components/Tabs';
import Center from '../../../../../containers/layouts/Center';
import { WORKFLOW_STATS } from '../../../../../graphql';
import {
  Filter,
  WorkflowStatsResponse,
  WorkflowStatsVars,
} from '../../../../../models/graphql/workflowStats';
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

  const { data, loading } = useQuery<WorkflowStatsResponse, WorkflowStatsVars>(
    WORKFLOW_STATS,
    {
      variables: {
        filter,
        project_id: projectID,
        show_workflow_runs: activeTab === 0,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const closedSeriesData: Array<GraphMetric> = [
    {
      metricName: activeTab === 0 ? 'Runs' : 'Schedules',
      data: data?.getWorkflowStats ?? [],
      baseColor: activeTab === 0 ? '#F6793E' : '#5B44BA',
    },
  ];

  function xAxisTimeFormat(filter: Filter) {
    switch (filter) {
      case Filter.Monthly:
        return 'MMM-YY';
      case Filter.Daily:
        return 'DD-MMM-YY';
      case Filter.Hourly:
        return 'HH[hrs]-DD';
      default:
        return 'MMM';
    }
  }

  return (
    <Paper elevation={0} className={classes.workflowGraphs}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        TabIndicatorProps={{
          style: {
            backgroundColor: theme.palette.primary.main,
          },
        }}
      >
        <StyledTab data-cy="receivedTab" label=" Run stats" {...tabProps(1)} />
        <StyledTab
          data-cy="activeTab"
          label="Schedule stats"
          {...tabProps(0)}
        />
      </Tabs>
      <div className={classes.graphContainer}>
        {loading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <LineAreaGraph
            closedSeries={closedSeriesData}
            showLegendTable={false}
            showPoints
            showTips
            showMultiToolTip
            yLabelOffset={35}
            xAxistimeFormat={xAxisTimeFormat(filter)}
            margin={{
              top: 20,
              left: 35,
              bottom: 30,
              right: 20,
            }}
          />
        )}
      </div>
    </Paper>
  );
};
export default ScheduleAndRunStats;
