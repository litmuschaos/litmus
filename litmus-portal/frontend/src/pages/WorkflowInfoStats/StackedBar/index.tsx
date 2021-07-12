import { useQuery } from '@apollo/client';
import { Typography, useTheme } from '@material-ui/core';
import { LineMetricSeries, StackBar, StackBarMetric } from 'litmus-ui';
import moment from 'moment';
import React, { useState } from 'react';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import { getProjectID } from '../../../utils/getSearchParams';
import { STATUS_RUNNING } from '../../ApplicationDashboard/constants';
import WorkflowRunTable from '../WorkflowRunTable';
import useStyles from './styles';

interface StackedBarGraphProps {
  date: number;
  workflowID: string;
  handleTableOpen: () => void;
  handleTableClose: () => void;
  showTable: boolean;
}
const StackedBarGraph: React.FC<StackedBarGraphProps> = ({
  date,
  workflowID,
  handleTableOpen,
  handleTableClose,
  showTable,
}) => {
  const projectID = getProjectID();
  const classes = useStyles();
  const theme = useTheme();
  const [workflowRunID, setWorkflowRunID] = useState<string>('');
  const stackBarData: Array<StackBarMetric> = [];

  const openSeries: LineMetricSeries = {
    metricName: 'Resiliency Score',
    data: [],
    baseColor: '#5469D4',
  };

  const { data, loading } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          workflow_ids: [workflowID],
          sort: {
            field: 'Time',
          },
          filter: {
            date_range: {
              start_date: moment.unix(date).startOf('day').unix().toString(),
              end_date: moment.unix(date).endOf('day').unix().toString(),
            },
          },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  if (data?.getWorkflowRuns.workflow_runs) {
    data.getWorkflowRuns.workflow_runs.forEach((wfrun) => {
      if (wfrun.phase !== STATUS_RUNNING) {
        stackBarData.push({
          id: wfrun.workflow_run_id,
          date: Number(wfrun.last_updated) * 1000,
          passPercentage:
            wfrun.total_experiments &&
            wfrun.experiments_passed &&
            wfrun.total_experiments > 0
              ? (wfrun.experiments_passed * 100) / wfrun.total_experiments
              : 0,
          failPercentage:
            wfrun.total_experiments &&
            !wfrun.experiments_failed &&
            wfrun.total_experiments > 0
              ? (wfrun.experiments_failed * 100) / wfrun.total_experiments
              : 0,
          passCount: wfrun.experiments_passed ?? 0,
          failCount: wfrun.experiments_failed ?? 0,
        });
        openSeries.data.push({
          date: Number(wfrun.last_updated) * 1000,
          value: wfrun.resiliency_score ?? 0,
        });
      }
    });
  }

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM, YYYY');
    if (date) return resDate;
    return 'Date not available';
  };

  return (
    <div>
      <Typography className={classes.stackbarHeader}>
        Workflow Activity
      </Typography>
      <div className={classes.date}>
        <Typography>{formatDate(date.toString())}</Typography>
        <hr className={classes.divider} />
      </div>
      <Typography className={classes.stackbarHelperText}>
        Click on a bar to see the details of the workflow run
      </Typography>
      {/* Border Starts */}
      <div style={{ border: `1px solid ${theme.palette.border.main}` }}>
        {/* Stackbar parent */}
        <div className={classes.stackbarParent}>
          {/* Stackbar Area */}
          {loading ||
          openSeries.data.length <= 0 ||
          stackBarData.length <= 0 ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <div
              style={{
                width: '62rem',
                height: '20rem',
              }}
            >
              <StackBar
                openSeries={openSeries}
                barSeries={stackBarData}
                unit="%"
                yLabel="Resiliency Score in %"
                yLabelOffset={60}
                xAxistimeFormat="HH:mm"
                handleBarClick={(barData: any) => {
                  if (barData) {
                    handleTableOpen();
                    setWorkflowRunID(barData as string);
                  } else {
                    handleTableClose();
                    setWorkflowRunID('');
                  }
                }}
              />
            </div>
          )}
        </div>
        {/* Legend */}
        <div className={classes.stackbarLegend}>
          <img src="./icons/failedTestIndicator.svg" alt="Failed legend" />
          <Typography>Failed test</Typography>
          <img src="./icons/passedTestIndicator.svg" alt="Passed legend" />
          <Typography>Passed test</Typography>
        </div>
        {/* Border Ends */}
      </div>
      {showTable && (
        <WorkflowRunTable
          workflowId={workflowID}
          workflowRunId={workflowRunID}
        />
      )}
    </div>
  );
};

export default StackedBarGraph;
