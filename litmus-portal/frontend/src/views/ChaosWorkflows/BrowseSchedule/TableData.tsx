import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TableCell,
  Typography,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import React from 'react';
import cronstrue from 'cronstrue';
import YAML from 'yaml';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useSelector } from 'react-redux';
import { ScheduleWorkflow } from '../../../models/graphql/scheduleData';
import useStyles from './styles';
import ExperimentPoints from './ExperimentPoints';
import { RootState } from '../../../redux/reducers';

interface TableDataProps {
  data: ScheduleWorkflow;
  deleteRow: (wfid: string) => void;
}

const TableData: React.FC<TableDataProps> = ({ data, deleteRow }) => {
  const classes = useStyles();
  // States for PopOver to display Experiment Weights
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const open = Boolean(anchorEl);
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };

  const userData = useSelector((state: RootState) => state.userData);

  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to download the manifest
  const downloadYAML = (manifest: string, name: string) => {
    const parsedYAML = YAML.parse(manifest);
    const doc = new YAML.Document();
    doc.contents = parsedYAML;
    const element = document.createElement('a');
    const file = new Blob([YAML.stringify(doc)], {
      type: 'text/yaml',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${name}.yaml`;
    document.body.appendChild(element);
    element.click();
  };

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    if (date) return resDate;
    return 'Date not available';
  };

  return (
    <>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterStartDate}>
          {formatDate(data.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.regularityData}>
          <div className={classes.expDiv}>
            <img src="/icons/calender.svg" alt="Calender" />
            <Typography style={{ paddingLeft: 10 }}>
              {data.cronSyntax === ''
                ? 'Once'
                : cronstrue.toString(data.cronSyntax)}
            </Typography>
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
              <Typography className={classes.expInfoActive}>
                <strong>Show Experiment</strong>
              </Typography>
              <KeyboardArrowDownIcon className={classes.expInfoActiveIcon} />
            </div>
          ) : (
            <div className={classes.expDiv}>
              <Typography className={classes.expInfo}>
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
            {data.weightages.map((expData) => {
              return (
                <div style={{ marginBottom: 8 }}>
                  <ExperimentPoints
                    expName={expData.experiment_name}
                    weight={expData.weightage}
                  />
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
          data-cy="browseScheduleOptions"
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
            value="Download"
            onClick={() =>
              downloadYAML(data.workflow_manifest, data.workflow_name)
            }
          >
            <div className={classes.expDiv}>
              <GetAppIcon className={classes.downloadBtn} />
              <Typography
                data-cy="downloadManifest"
                className={classes.downloadText}
              >
                Download Manifest
              </Typography>
            </div>
          </MenuItem>
          {userData.userRole !== 'Viewer' ? (
            <MenuItem
              value="Analysis"
              onClick={() => deleteRow(data.workflow_id)}
            >
              <div className={classes.expDiv}>
                <img
                  src="/icons/deleteSchedule.svg"
                  alt="Delete Schedule"
                  className={classes.btnImg}
                />
                <Typography
                  data-cy="deleteSchedule"
                  className={classes.btnText}
                >
                  Delete Schedule
                </Typography>
              </div>
            </MenuItem>
          ) : null}
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
