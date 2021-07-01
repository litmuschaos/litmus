import { Typography } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import AnalyticsLinearProgressBar from '../../../components/ProgressBar/AnalyticsLinearProgressBar';
import LinearProgressBar from '../../../components/ProgressBar/LinearProgressBar';
import ExperimentStatus from '../../../views/Analytics/WorkflowDashboard/ExperimentStatus';
import useStyles, { StyledTableCell } from './styles';

interface WorkFlowTests {
  test_id: number;
  test_name: string;
  exp_name: string;
  test_result: string;
  test_weight: number;
  resulting_points: number;
  last_run: string;
  context: string;
}
interface TableDataProps {
  data: WorkFlowTests;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM  HH:mm');
    return resDate;
  };
  return (
    <>
      <StyledTableCell className={classes.testName}>
        <Typography variant="body2">
          <strong>{data.test_name}</strong>
        </Typography>
        {data?.context !== '' ? (
          <Typography variant="body2" className={classes.context}>
            context: {data.context}
          </Typography>
        ) : (
          <></>
        )}
      </StyledTableCell>
      <StyledTableCell>
        <Typography variant="body2">
          <strong>{data.exp_name}</strong>
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <ExperimentStatus
          status={
            data.test_result !== 'Awaited' && data.test_result !== 'N/A'
              ? `${data.test_result}ed`
              : data.test_result
          }
        />
      </StyledTableCell>

      <StyledTableCell>
        <Typography className={classes.reliabilityDataTypography}>
          {data.test_weight} Points
        </Typography>
        <div className={classes.progressBar}>
          <AnalyticsLinearProgressBar
            value={data.test_weight ?? 0}
            maxValue={10}
            isInTable
          />
        </div>
      </StyledTableCell>

      <StyledTableCell>
        <Typography>{data.resulting_points} Points</Typography>
        <div className={classes.progressBar}>
          <LinearProgressBar width={0.2} value={data.resulting_points ?? 0} />
        </div>
      </StyledTableCell>

      <StyledTableCell>
        <Typography>{formatDate(data.last_run)}</Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
