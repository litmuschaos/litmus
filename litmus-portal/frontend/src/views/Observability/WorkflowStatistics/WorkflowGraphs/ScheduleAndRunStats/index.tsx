import { useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Tabs,
  useTheme,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { GraphMetric, LineAreaGraph } from 'litmus-ui';
import React, { useState } from 'react';
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
import useStyles, { useOutlinedInputStyles } from './style';

// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ScheduleAndRunStats: React.FC = () => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const projectID = getProjectID();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, actTab: number) => {
    setActiveTab(actTab);
  };

  const [filters, setFilters] = useState<Filter>(Filter.MONTHLY);

  const { data, loading } = useQuery<WorkflowStatsResponse, WorkflowStatsVars>(
    WORKFLOW_STATS,
    {
      variables: {
        filter: filters,
        projectID,
        showWorkflowRuns: activeTab === 0,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const closedSeriesData: Array<GraphMetric> = [
    {
      metricName: activeTab === 0 ? 'Runs' : 'Schedules',
      data: data?.listWorkflowStats ?? [],
      baseColor: activeTab === 0 ? '#F6793E' : '#5B44BA',
    },
  ];

  function xAxisTimeFormat(filter: Filter) {
    switch (filter) {
      case Filter.MONTHLY:
        return 'MMM-YY';
      case Filter.DAILY:
        return 'DD-MMM-YY';
      case Filter.HOURLY:
        return 'HH[hrs]-DD';
      default:
        return 'MMM';
    }
  }

  return (
    <Paper elevation={0} className={classes.workflowGraphs}>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel className={classes.selectText}> Granularity </InputLabel>
        <Select
          label="Granularity"
          value={filters}
          onChange={(event) => {
            setFilters(event.target.value as Filter);
          }}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
          IconComponent={KeyboardArrowDownIcon}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
            getContentAnchorEl: null,
            classes: { paper: classes.menuList },
          }}
        >
          <MenuItem value={Filter.MONTHLY} className={classes.menuListItem}>
            Monthly
          </MenuItem>
          <MenuItem value={Filter.DAILY} className={classes.menuListItem}>
            Daily
          </MenuItem>
          <MenuItem value={Filter.HOURLY} className={classes.menuListItem}>
            Hourly
          </MenuItem>
        </Select>
      </FormControl>
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
            yLabel={activeTab === 0 ? 'No. of Runs' : 'No. of Schedules'}
            xAxistimeFormat={xAxisTimeFormat(filters)}
            margin={{
              top: 20,
              left: 55,
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
