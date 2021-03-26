import { Typography } from '@material-ui/core';
import React from 'react';
import CheckBox from '../../../../components/CheckBox';
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import useStyles, { StyledTableCell } from './styles';

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
      <StyledTableCell className={classes.workflowName}>
        <Typography>
          <strong>{data.legend}</strong>
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>
          {data.workflow}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <div className={classes.regularityData}>
          <Typography className={classes.paddedText}>
            {data.experiment}
          </Typography>
        </div>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>{data.target}</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>
          <strong>{data.result}</strong>
        </Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
