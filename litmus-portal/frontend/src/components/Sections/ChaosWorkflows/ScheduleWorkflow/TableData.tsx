import React from 'react';
import {
  TableCell,
  Typography,
  IconButton,
  MenuItem,
  Menu,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import useStyles from './styles';

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

  const formatDate = (date: any) => {
    const updated = new Date(date * 1000).toString();
    const day = updated.slice(8, 10);
    const month = updated.slice(4, 7);
    const year = updated.slice(11, 15);
    const resDate = `${day}  ${month}  ${year}`;
    return resDate;
  };

  return (
    <>
      <TableCell className={classes.workflowName}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>
          {formatDate(JSON.parse(data.execution_data).startedAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.reliabiltyData}>
          <Typography>Every Monday</Typography>
        </div>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>
          {data.cluster_name}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.timeDiv}>
          <Typography className={classes.timeData}>
            {data.cluster_name}
          </Typography>
        </div>
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
          <MenuItem value="Workflow" onClick={handleMenu}>
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
