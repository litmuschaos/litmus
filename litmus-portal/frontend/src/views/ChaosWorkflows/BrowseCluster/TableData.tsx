import { TableCell, Typography } from '@material-ui/core';
import React from 'react';
import {
  ExecutionData,
  WorkflowRun,
} from '../../../models/graphql/workflowData';
import useStyles from './styles';

interface TableDataProps {
  data: WorkflowRun;
  exeData: ExecutionData;
}

const TableData = () => {
  const classes = useStyles();

  return (
    <>
      <TableCell className={classes.tableDataStatus}>Status</TableCell>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <strong>cluster</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>Name</Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.stepsData}>#</Typography>
      </TableCell>
      <TableCell>
        <Typography>Time</Typography>
      </TableCell>
      <TableCell>Run</TableCell>
    </>
  );
};
export default TableData;
