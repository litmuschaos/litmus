import React, { useRef } from 'react';
import { TableCell, Typography, IconButton, Checkbox } from '@material-ui/core';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import DateRangeOutlinedIcon from '@material-ui/icons/DateRangeOutlined';
import moment from 'moment';
import { history } from '../../../../redux/configureStore';
import useStyles from './styles';

interface TableDataProps {
  data: any;
  itemSelectionStatus: any;
  labelIdentifier: any;
  comparisonState: Boolean;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  itemSelectionStatus,
  labelIdentifier,
  comparisonState,
}) => {
  const classes = useStyles();

  // const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);

  const profileMenuRef = useRef();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: any) => {
    const updated = new Date(date * 1000).toString();
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
        <Typography variant="body2">
          <u>
            <strong>{data.workflow_name}</strong>
          </u>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" className={classes.tableObjects}>
          {formatDate(data.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        <DateRangeOutlinedIcon className={classes.calIcon} />
        <Typography variant="body2" className={classes.tableObjectRegularity}>
          {/* data.regularity */}
          Once
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" className={classes.tableObjects}>
          {data.cluster_name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" className={classes.tableObjects}>
          <strong>See analytics</strong>
          <IconButton
            edge="end"
            ref={profileMenuRef as any}
            aria-label="analytics for workflow id"
            aria-haspopup="true"
            onClick={() =>
              history.push(`/workflows/analytics/${data.workflow_id}`)
            }
            /*  className={
              isProfilePopoverOpen
                ? classes.buttonPositionExpand
                : classes.buttonPositionClose
            }
            */
          >
            <ExpandMoreTwoToneIcon htmlColor="black" />
          </IconButton>
        </Typography>
      </TableCell>
    </>
  );
};
export default TableData;
