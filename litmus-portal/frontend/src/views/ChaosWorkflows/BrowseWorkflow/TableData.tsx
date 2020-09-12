import {
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import React from 'react';
import {
  ExecutionData,
  WorkflowRun,
} from '../../../models/graphql/workflowData';
import { history } from '../../../redux/configureStore';
import timeDifferenceForDate from '../../../utils/datesModifier';
import LinearProgressBar from '../../../components/ProgressBar/LinearProgressBar';
import CustomStatus from '../CustomStatus/Status';
import useStyles from './styles';

interface TableDataProps {
  data: WorkflowRun;
  exeData: ExecutionData;
}

const TableData: React.FC<TableDataProps> = ({ data, exeData }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableCell className={classes.tableDataStatus}>
        <CustomStatus status={exeData.phase} />
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
          {exeData.phase === 'Failed' || exeData.phase === '' ? (
            <>
              <Typography>
                Overall RR: <span className={classes.failed}>0%</span>
              </Typography>
              <div className={classes.progressBar}>
                <LinearProgressBar value={0} />
              </div>
            </>
          ) : (
            <>
              <Typography>
                Overall RR: <span className={classes.success}>100%</span>
              </Typography>
              <div className={classes.progressBar}>
                <LinearProgressBar value={100} />
              </div>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Typography className={classes.stepsData}>
          {Object.keys(exeData.nodes).length}
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
              history.push(`/workflows/details/${data.workflow_run_id}`)
            }
          >
            <div className={classes.expDiv}>
              <img
                src="/icons/show-workflow.svg"
                alt="Display Workflow"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                Show the workflow
              </Typography>
            </div>
          </MenuItem>
          <MenuItem
            value="Analysis"
            onClick={() =>
              history.push(`/workflows/analytics/${data.workflow_run_id}`)
            }
          >
            <div className={classes.expDiv}>
              <img
                src="/icons/show-analytics.svg"
                alt="Display Analytics"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                Show the analytics
              </Typography>
            </div>
          </MenuItem>
          {/* <MenuItem value="Scheduler" onClick={handleMenu}>
            Show the scheduler
          </MenuItem> */}
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
