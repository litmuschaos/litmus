import React from 'react';
import {
  TableCell,
  Typography,
  IconButton,
  MenuItem,
  Menu,
  Popover,
  Button,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import useStyles from './styles';
import LinearProgressBar from '../../ReturningHome/ProgressBar/LinearProgressBar';
import { history } from '../../../../redux/configureStore';

interface TableDataProps {
  data: any;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
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
    const resDate = `${day} ${month} ${year}`;
    return resDate;
  };
  const exWeight = [
    {
      name: 'Node add test',
      value: 10,
    },
    {
      name: 'Networking pod test',
      value: 7,
    },
    {
      name: 'Config map test',
      value: 3,
    },
    {
      name: 'Proxy-service-test',
      value: 5,
    },
  ];
  return (
    <>
      <TableCell align="center" className={classes.workflowNameData}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterStartDate}>
          {formatDate(JSON.parse(data.execution_data).startedAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.regularityData}>
          <div className={classes.expDiv}>
            <img src="/icons/calender.svg" alt="Calender" />
            <Typography style={{ paddingLeft: 10 }}>Once </Typography>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Typography>{data.cluster_name}</Typography>
      </TableCell>
      <TableCell>
        <Button onClick={handlePopOverClick} style={{ textTransform: 'none' }}>
          {isOpen ? (
            <div className={classes.expDiv}>
              <Typography className={classes.expInfo}>
                <strong>Show Experiment</strong>
              </Typography>
              <KeyboardArrowDownIcon className={classes.expInfo} />
            </div>
          ) : (
            <div className={classes.expDiv1}>
              <Typography>
                <strong>Show Experiment</strong>
              </Typography>
              <ChevronRightIcon />
            </div>
          )}
        </Button>
        <Popover
          id={id}
          open={isOpen}
          anchorEl={popAnchorEl}
          onClose={handlePopOverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          style={{
            marginTop: 10,
          }}
        >
          <div className={classes.weightDiv}>
            {exWeight.map((expData) => {
              return (
                <div style={{ marginBottom: 10 }}>
                  <div className={classes.weightInfo}>
                    <Typography>{expData.name}</Typography>
                    <Typography style={{ marginLeft: 'auto' }}>
                      {expData.value} points
                    </Typography>
                  </div>
                  <LinearProgressBar value={expData.value} />
                </div>
              );
            })}
          </div>
        </Popover>
      </TableCell>
      <TableCell className={classes.menuCell}>
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
                pathname: '/schedule',
                state: data,
              })
            }
          >
            <div className={classes.expDiv}>
              <img
                src="/icons/editSchedule.svg"
                alt="Edit Schedule"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>Edit Schedule</Typography>
            </div>
          </MenuItem>
          <MenuItem value="Analysis" onClick={handleMenu}>
            <div className={classes.expDiv}>
              <img
                src="/icons/deleteSchedule.svg"
                alt="Delete Schedule"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                Delete Schedule
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
