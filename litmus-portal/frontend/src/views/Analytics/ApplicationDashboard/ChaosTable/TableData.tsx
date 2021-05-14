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
          inputProps={{ 'aria-labelledby': labelIdentifier }}
        />
      </StyledTableCell>
      <StyledTableCell>
        <div
          className={classes.colorBar}
          style={{
            background: data.legend,
          }}
        />
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '25rem' }}
        >
          {data.workflow}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '10rem' }}
        >
          {data.experiment}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '15rem' }}
        >
          {data.target}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={`${classes.tableObjects} ${
            data.result === CHAOS_EXPERIMENT_VERDICT_PASS
              ? classes.pass
              : data.result === CHAOS_EXPERIMENT_VERDICT_FAIL
              ? classes.fail
              : classes.awaited
          }`}
        >
          {data.result}
        </Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
