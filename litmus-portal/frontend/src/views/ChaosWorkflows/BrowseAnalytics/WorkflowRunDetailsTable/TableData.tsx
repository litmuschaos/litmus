import React from 'react';
import { TableCell, Typography } from '@material-ui/core';
import moment from 'moment';
import useStyles from './styles';
import CustomStatus from '../CustomStatus/Status';
import LinearProgressBar from '../../../../components/ProgressBar/LinearProgressBar';

interface workFlowTests {
  test_id: number;
  test_name: string;
  test_result: string;
  weight?: number;
  resulting_points?: number;
  last_run: string;
}

interface TableDataProps {
  data: workFlowTests;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: any) => {
    const updated = new Date(date * 1000).toString();
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
        <CustomStatus status={`${data.test_result}ed`} />
      </TableCell>

      <TableCell>
        <div className={classes.reliabiltyData}>
          <Typography style={{ fontWeight: 500 }}>
            {data.weight} Points
          </Typography>
          <div className={classes.progressBar}>
            <LinearProgressBar value={data.weight ?? 0} />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className={classes.reliabiltyData}>
          <Typography>{data.resulting_points} Points</Typography>
          <div className={classes.progressBar}>
            <LinearProgressBar value={data.resulting_points ?? 0} />
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
