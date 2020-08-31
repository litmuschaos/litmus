import React from 'react';
import {
  TableCell,
  Typography,
  IconButton,
  MenuItem,
  Menu,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CustomStatus from '../CustomStatus/Status';
import LinearProgressBar from '../../ReturningHome/ProgressBar/LinearProgressBar';
import useStyles from './styles';
import timeDifferenceForDate from '../../../../utils/datesModifier';
import { history } from '../../../../redux/configureStore';

interface TableDataProps {
  data: any;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenu = () => {};
  return (
    <>
      <TableCell className={classes.headerStatus1}>
        <CustomStatus status={JSON.parse(data.execution_data).phase} />
      </TableCell>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>
          {data.cluster_name}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.reliabiltyData}>
          {JSON.parse(data.execution_data).phase === 'Failed' ? (
            <>
              <Typography>Overall RR: 0</Typography>
              <div className={classes.progressBar}>
                <LinearProgressBar value={0} />
              </div>
            </>
          ) : (
            <>
              <Typography>Overall RR: 100</Typography>
              <div className={classes.progressBar}>
                <LinearProgressBar value={100} />
              </div>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Typography className={classes.stepsData}>
          {Object.keys(JSON.parse(data.execution_data).nodes).length}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>{timeDifferenceForDate(data.last_updated)}</Typography>
      </TableCell>
      <TableCell>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={classes.optionBtn}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          <MenuItem
            value="Workflow"
            onClick={() =>
              history.push({
                pathname: '/workflows/workflow-underground',
                state: data,
              })
            }
          >
            Show the workflow
          </MenuItem>
          <MenuItem value="Analysis" onClick={handleMenu}>
            Show the analysis
          </MenuItem>
          <MenuItem value="Scheduler" onClick={handleMenu}>
            Show the scheduler
          </MenuItem>
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
