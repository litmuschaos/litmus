import React from 'react';
import { TableCell, Typography } from '@material-ui/core';
import moment from 'moment';
import useStyles from './styles';
import ExperimentStatus from '../ExperimentStatus';
import LinearProgressBar from '../../../../components/ProgressBar/LinearProgressBar';
import AnalyticsLinearProgressBar from '../../../../components/ProgressBar/AnalyticsLinearProgressBar/index';

interface workFlowTests {
  test_id: number;
  test_name: string;
  test_result: string;
  test_weight: number;
  resulting_points: number;
  last_run: string;
}

interface TableDataProps {
  data: workFlowTests;
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
      <TableCell className={classes.testName}>
        <Typography variant="body2">
          <strong>{data.test_name}</strong>
        </Typography>
      </TableCell>

      <TableCell className={classes.tableDataStatus}>
        <ExperimentStatus
          status={
            data.test_result !== 'Awaited' && data.test_result !== 'N/A'
              ? `${data.test_result}ed`
              : data.test_result
          }
        />
      </TableCell>

      <TableCell>
        <div className={classes.reliabiltyData}>
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
        </div>
      </TableCell>

      <TableCell>
        <div className={classes.reliabiltyData}>
          <Typography>{data.resulting_points} Points</Typography>
          <div className={classes.progressBar}>
            <LinearProgressBar width={2} value={data.resulting_points ?? 0} />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Typography variant="body2" className={classes.tableObjects}>
          {formatDate(data.last_run)}
        </Typography>
      </TableCell>

      <TableCell />
    </>
  );
};
export default TableData;
