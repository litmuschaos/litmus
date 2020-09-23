import React from 'react';
import { TableCell, Typography, IconButton, Checkbox } from '@material-ui/core';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import moment from 'moment';
import { history } from '../../../../redux/configureStore';
import useStyles from './styles';
import { ScheduleWorkflow } from '../../../../models/graphql/scheduleData';

interface TableDataProps {
  data: ScheduleWorkflow;
  itemSelectionStatus: boolean;
  labelIdentifier: string;
  comparisonState: Boolean;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  itemSelectionStatus,
  labelIdentifier,
  comparisonState,
}) => {
  const classes = useStyles();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    return resDate;
  };

  return (
    <>
      <TableCell padding="checkbox" className={classes.checkbox}>
        {comparisonState === false ? (
          <Checkbox
            checked={itemSelectionStatus}
            inputProps={{ 'aria-labelledby': labelIdentifier }}
          />
        ) : (
          <div />
        )}
      </TableCell>
      <TableCell className={classes.workflowName}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.tableObjects}>
          {formatDate(data.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        &nbsp;
        <img
          src="/icons/calender.svg"
          alt="Calender"
          className={classes.calIcon}
        />
        <Typography className={classes.tableObjectRegularity}>
          {/* data.regularity */}
          Once
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.tableObjects}>
          &nbsp;{data.cluster_name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.tableObjects}>
          <strong>See analytics</strong>
          <IconButton
            edge="end"
            aria-label="analytics for workflow id"
            aria-haspopup="true"
            onClick={() =>
              history.push(`/workflows/analytics/${data.workflow_id}`)
            }
            className={classes.buttonSeeAnalytics}
          >
            <ExpandMoreTwoToneIcon htmlColor="black" />
          </IconButton>
        </Typography>
      </TableCell>
    </>
  );
};
export default TableData;
