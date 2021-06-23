import { useQuery } from '@apollo/client';
import { Typography, useTheme } from '@material-ui/core';
import {
  BarDateValue,
  LineMetricSeries,
  StackBar,
  StackBarMetric,
} from 'litmus-ui';
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
}
const StackedBarGraph: React.FC<StackedBarGraphProps> = ({
  date,
  workflowID,
}) => {
  const projectID = getProjectID();
  const classes = useStyles();
  const theme = useTheme();
  const [showTable, setShowTable] = useState<boolean>(false);
  const [workflowRunID, setWorkflowRunID] = useState<string>('');

  const [graphData, setGraphData] = useState<StackBarMetric[]>([]);
  const stackBarData: Array<StackBarMetric> = [];
  const [openSeriesData, setOpenSeriesData] = useState<LineMetricSeries>({
    metricName: 'probe',
    data: [],
    baseColor: '#5469D4',
  });
  const openseries: Array<BarDateValue> = [];

  const { loading } = useQuery<Workflow, WorkflowDataVars>(WORKFLOW_DETAILS, {
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
    onCompleted: (data) => {
      console.log(data);
      data.getWorkflowRuns.workflow_runs.map((wfrun) => {
        console.log(wfrun);
        wfrun.phase !== STATUS_RUNNING &&
          stackBarData.push({
            id: wfrun.workflow_run_id,
            date: Number(wfrun.last_updated) * 1000,
            passPercentage:
              wfrun.total_experiments &&
              wfrun.experiments_passed !== undefined &&
              wfrun.total_experiments > 0
                ? (wfrun.experiments_passed * 100) / wfrun.total_experiments
                : 0,
            failPercentage:
              wfrun.total_experiments &&
              wfrun.experiments_passed !== undefined &&
              wfrun.total_experiments > 0
                ? ((wfrun.total_experiments - wfrun.experiments_passed) * 100) /
                  wfrun.total_experiments
                : 0,
            passCount: wfrun.experiments_passed ?? 0,
            failCount:
              wfrun.total_experiments &&
              wfrun.experiments_passed !== undefined &&
              wfrun.total_experiments > 0
                ? wfrun.total_experiments - wfrun.experiments_passed
                : 0,
          });
        openseries.push({
          date: Number(wfrun.last_updated) * 1000,
          value: wfrun.resiliency_score ?? 0,
        });
      });
      setOpenSeriesData({ ...openSeriesData, data: openseries });
      setGraphData(stackBarData);
    },
    fetchPolicy: 'cache-and-network',
  });

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM, YYYY');
    if (date) return resDate;
    return 'Date not available';
  };
  console.log('click', showTable);

  // console.log('bar data', graphData);
  // console.log('open', openSeriesData);
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
      <div
        style={{
          width: '64rem',
          height: '21.68rem',
          margin: theme.spacing(3, 0),
          border: `1px solid ${theme.palette.border.main}`,
          padding: theme.spacing(2.5, 3.5, 2.5, 0),
        }}
      >
        {loading && openSeriesData.data.length <= 0 && graphData.length <= 0 ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <StackBar
            openSeries={openSeriesData}
            barSeries={graphData}
            unit="%"
            yLabel="Chaos"
            yLabelOffset={60}
            // initialxAxisDate={1624182897000}
            xAxistimeFormat="HH"
            handleBarClick={(barData: any) => {
              setShowTable(true);
              setWorkflowRunID(barData as string);
              console.log('click', barData);
            }}
          />
        )}
      </div>
      {showTable ? (
        <WorkflowRunTable
          workflowId={workflowID}
          workflowRunId={workflowRunID}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default StackedBarGraph;
