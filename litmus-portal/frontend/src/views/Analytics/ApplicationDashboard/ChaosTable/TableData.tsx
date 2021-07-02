import { Typography } from '@material-ui/core';
import React from 'react';
import { CheckBox } from '../../../../components/CheckBox';
import { StyledTableCell } from '../../../../components/StyledTableCell';
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import {
  CHAOS_EXPERIMENT_VERDICT_FAIL,
  CHAOS_EXPERIMENT_VERDICT_PASS,
} from '../../../../pages/ApplicationDashboard/constants';
import useStyles from './styles';

interface TableDataProps {
  data: ChaosEventDetails;
  itemSelectionStatus: boolean;
  labelIdentifier: string;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  itemSelectionStatus,
  labelIdentifier,
}) => {
  const classes = useStyles();

  return (
    <>
      <StyledTableCell padding="checkbox" className={classes.checkbox}>
        <CheckBox
          checked={itemSelectionStatus}
          disabled={data.injectionFailed}
          inputProps={{ 'aria-labelledby': labelIdentifier }}
        />
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '15rem' }}
        >
          <div
            className={classes.colorCircle}
            style={{ background: data.legendColor }}
          />
          {data.chaosResultName}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '12.5rem' }}
        >
          {data.workflow}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '7.5rem' }}
        >
          {data.engineContext}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={`${classes.tableObjects} ${
            data.verdict === CHAOS_EXPERIMENT_VERDICT_PASS
              ? classes.pass
              : data.verdict === CHAOS_EXPERIMENT_VERDICT_FAIL
              ? classes.fail
              : classes.awaited
          }`}
        >
          {data.verdict}
        </Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
