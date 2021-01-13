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
import GetAppIcon from '@material-ui/icons/GetApp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import cronstrue from 'cronstrue';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import Unimodal from '../../../containers/layouts/Unimodal';
import { ScheduleWorkflow } from '../../../models/graphql/scheduleData';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { history } from '../../../redux/configureStore';
import { RootState } from '../../../redux/reducers';
import { ReactComponent as CrossMarkIcon } from '../../../svg/crossmark.svg';
import ExperimentPoints from './ExperimentPoints';
import useStyles from './styles';

interface TableDataProps {
  data: ScheduleWorkflow;
  deleteRow: (wfid: string) => void;
}

interface Weights {
  experimentName: string;
  weight: number;
}

const TableData: React.FC<TableDataProps> = ({ data, deleteRow }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // States for PopOver to display Experiment Weights
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const open = Boolean(anchorEl);
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };

  const workflow = useActions(WorkflowActions);
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

  const editSchedule = () => {
    history.push(
      `/workflows/schedule/${data.project_id}/${data.workflow_name}`
    );
  };

  // If regularity is not Once then set recurring schedule state to true
  if (data.cronSyntax !== '') {
    workflow.setWorkflowDetails({
      isRecurring: true,
    });
  }

  return (
    <>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <span
            className={
              YAML.parse(data.workflow_manifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            <strong>{data.workflow_name}</strong>
          </span>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterStartDate}>
          <span
            className={
              YAML.parse(data.workflow_manifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            {formatDate(data.created_at)}
          </span>
        </Typography>
      </TableCell>
      <TableCell>
        <div className={classes.regularityData}>
          <div className={classes.expDiv}>
            <img src="/icons/calender.svg" alt="Calender" />
            <Typography style={{ paddingLeft: 10 }}>
              <span
                className={
                  YAML.parse(data.workflow_manifest).spec.suspend === true
                    ? classes.dark
                    : ''
                }
              >
                {data.cronSyntax === ''
                  ? 'Once'
                  : cronstrue.toString(data.cronSyntax)}
              </span>
            </Typography>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Typography>
          <span
            className={
              YAML.parse(data.workflow_manifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            {data.cluster_name}
          </span>
        </Typography>
      </TableCell>
      <TableCell>
        <Button onClick={handlePopOverClick} style={{ textTransform: 'none' }}>
          <span
            className={
              YAML.parse(data.workflow_manifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
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
          </span>
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
          {data.cronSyntax !== '' ? (
            <MenuItem value="Edit_Schedule" onClick={() => editSchedule()}>
              <div className={classes.expDiv}>
                <img
                  src="./icons/Edit.svg"
                  alt="Edit Schedule"
                  className={classes.btnImg}
                />
                <Typography data-cy="editSchedule" className={classes.btnText}>
                  Edit Schedule
                </Typography>
              </div>
            </MenuItem>
          ) : (
            <></>
          )}
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
            <MenuItem value="Analysis" onClick={() => setIsModalOpen(true)}>
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
      {isModalOpen ? (
        <Unimodal open={isModalOpen} handleClose={handleClose} hasCloseBtn>
          <div className={classes.modalDiv}>
            <CrossMarkIcon />
            <Typography className={classes.modalHeader}>
              {t('createWorkflow.scheduleWorkflow.modalHeader')}
            </Typography>
            <Typography className={classes.modalConfirm}>
              {t('createWorkflow.scheduleWorkflow.modalSubheader')}
            </Typography>
            <div className={classes.modalBtns}>
              <ButtonOutline
                isDisabled={false}
                handleClick={() => setIsModalOpen(false)}
              >
                {t('createWorkflow.scheduleWorkflow.cancelBtn')}
              </ButtonOutline>
              <ButtonFilled
                isPrimary={false}
                isWarning
                handleClick={() => {
                  deleteRow(data.workflow_id);
                  setIsModalOpen(false);
                }}
              >
                {t('createWorkflow.scheduleWorkflow.deleteBtn')}
              </ButtonFilled>
            </div>
          </div>
        </Unimodal>
      ) : (
        <></>
      )}
    </>
  );
};
export default TableData;
