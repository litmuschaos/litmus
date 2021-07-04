import { Typography } from '@material-ui/core';
import React from 'react';
import { CheckBox } from '../../../../components/CheckBox';
import { StyledTableCell } from '../../../../components/StyledTableCell';
import TextPopOver from '../../../../components/TextPopOver';
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
        {!data.injectionFailed && (
          <CheckBox
            checked={itemSelectionStatus}
            inputProps={{ 'aria-labelledby': labelIdentifier }}
          />
        )}
      </StyledTableCell>
      <StyledTableCell className={classes.flexObject}>
        {!data.injectionFailed && (
          <div
            className={classes.colorCircle}
            style={{ background: data.legendColor }}
          />
        )}
        <TextPopOver
          text={data.chaosResultName}
          className={classes.tableObjects}
          style={{ maxWidth: '15rem' }}
        />
      </StyledTableCell>
      <StyledTableCell>
        <TextPopOver
          text={data.workflow}
          className={classes.tableObjects}
          style={{ maxWidth: '12.5rem' }}
        />
      </StyledTableCell>
      <StyledTableCell>
        <TextPopOver
          text={data.engineContext}
          className={classes.tableObjects}
          style={{ maxWidth: '7.5rem' }}
        />
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
          {!data.injectionFailed ? data.verdict : 'Failed to Inject'}
        </Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
