import { useMutation } from '@apollo/client';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Snackbar,
  TableCell,
  Typography,
} from '@material-ui/core';
import { InsertDriveFileOutlined } from '@material-ui/icons';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import GetAppIcon from '@material-ui/icons/GetApp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ReplayIcon from '@material-ui/icons/Replay';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, Icon, Modal } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import { RERUN_CHAOS_WORKFLOW } from '../../../graphql/mutations';
import { ScheduledWorkflow } from '../../../models/graphql/workflowListData';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { history } from '../../../redux/configureStore';
import { ReactComponent as CrossMarkIcon } from '../../../svg/crossmark.svg';
import timeDifferenceForDate from '../../../utils/datesModifier';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import {
  validateCronParser,
  validateCronSyntax,
} from '../../../utils/validate';
import ExperimentPoints from './ExperimentPoints';
import SaveTemplateModal from './SaveTemplateModal';
import useStyles from './styles';

interface TableDataProps {
  data: ScheduledWorkflow;
  deleteRow: (wfid: string) => void;
  handleToggleSchedule: (schedule: ScheduledWorkflow) => void;
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  deleteRow,
  handleToggleSchedule,
  setWorkflowName,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const workflow = useActions(WorkflowActions);

  // States for PopOver to display Experiment Weights
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] =
    React.useState<boolean>(false);

  const tabs = useActions(TabActions);
  const open = Boolean(anchorEl);
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };

  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsModalOpen(false);
  };

  const [displayReRunAlert, setDisplayReRunAlert] = React.useState(false);
  const [reRunMessage, setReRunMessage] = React.useState('');
  const handleAlertOnClose = () => {
    setReRunMessage('');
    setDisplayReRunAlert(false);
  };

  // States for PopOver to display schedule details
  const [popAnchorElSchedule, setPopAnchorElSchedule] =
    React.useState<null | HTMLElement>(null);
  const isOpenSchedule = Boolean(popAnchorElSchedule);
  const idSchedule = isOpenSchedule ? 'simple-popover' : undefined;
  const handlePopOverCloseForSchedule = () => {
    setPopAnchorElSchedule(null);
  };

  const handlePopOverClickForSchedule = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setPopAnchorElSchedule(event.currentTarget);
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
    history.push({
      pathname: `/scenarios/schedule/${data.projectID}/${data.workflowName}`,
      search: `?projectID=${projectID}&projectRole=${projectRole}`,
    });
  };

  const [reRunChaosWorkFlow] = useMutation(RERUN_CHAOS_WORKFLOW, {
    onCompleted: () => {
      tabs.changeWorkflowsTabs(1);
    },
    onError: (error) => {
      setReRunMessage(error.message);
      setDisplayReRunAlert(true);
    },
  });

  const reRunSchedule = () => {
    reRunChaosWorkFlow({
      variables: {
        projectID: getProjectID(),
        workflowID: data.workflowID,
      },
    });
  };

  const handleSaveWorkflowTemplate = (manifest: string) => {
    const parsedYAML = YAML.parse(manifest);
    if (parsedYAML.metadata.labels !== undefined) {
      const labelData = parsedYAML.metadata.labels;
      if (labelData.cluster_id !== undefined) {
        delete labelData.cluster_id;
      }
      if (labelData.workflow_id !== undefined) {
        delete labelData.workflow_id;
      }
    }
    workflow.setWorkflowManifest({
      manifest: YAML.stringify(parsedYAML),
    });
    setIsTemplateModalOpen(true);
  };

  const handleCloseTemplate = () => {
    setIsTemplateModalOpen(false);
  };

  return (
    <>
      <Modal
        width="60%"
        open={isTemplateModalOpen}
        onClose={handleCloseTemplate}
        disableBackdropClick
        modalActions={
          <ButtonOutlined onClick={handleCloseTemplate}>
            &#x2715;
          </ButtonOutlined>
        }
      >
        <SaveTemplateModal
          closeTemplate={handleCloseTemplate}
          isCustomWorkflow={data.isCustomWorkflow as unknown as boolean}
        />
      </Modal>
      <TableCell className={classes.workflowNameData}>
        <Typography>
          <span
            className={`${classes.boldText} ${
              YAML.parse(data.workflowManifest).spec.suspend === true
                ? classes.dark
                : ''
            }`}
          >
            {data.workflowName}
          </span>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterData}>
          <span
            className={
              YAML.parse(data.workflowManifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            {data.clusterName}
          </span>
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterData}>
          <span>{data.lastUpdatedBy || '-'}</span>
        </Typography>
      </TableCell>
      <TableCell>
        <Button
          onClick={handlePopOverClick}
          className={classes.buttonTransform}
        >
          <span
            className={
              YAML.parse(data.workflowManifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            <div className={classes.expDiv}>
              <Typography className={`${classes.boldText} ${classes.expInfo}`}>
                {t('chaosWorkflows.browseSchedules.showExperiments')}
              </Typography>
              {isOpen ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />}
            </div>
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
        >
          <div className={classes.weightDiv}>
            {data.weightages.map((expData) => {
              return (
                <div key={expData.experimentName} style={{ marginBottom: 8 }}>
                  <ExperimentPoints
                    expName={expData.experimentName}
                    weight={expData.weightage}
                  />
                </div>
              );
            })}
          </div>
        </Popover>
      </TableCell>
      <TableCell>
        <Button
          onClick={handlePopOverClickForSchedule}
          className={classes.buttonTransform}
        >
          <span
            className={
              YAML.parse(data.workflowManifest).spec.suspend === true
                ? classes.dark
                : ''
            }
          >
            <div className={classes.expDiv}>
              <Typography className={`${classes.boldText} ${classes.expInfo}`}>
                {t('chaosWorkflows.browseSchedules.showSchedule')}
              </Typography>
              {isOpenSchedule ? (
                <KeyboardArrowDownIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </div>
          </span>
        </Button>
        <Popover
          id={idSchedule}
          open={isOpenSchedule}
          anchorEl={popAnchorElSchedule}
          onClose={handlePopOverCloseForSchedule}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className={classes.weightDiv}>
            <Typography className={classes.scheduleDetailsFlex}>
              <span className={classes.boldText}>
                {t('chaosWorkflows.browseSchedules.startingDate')} :
              </span>
              <span className={classes.scheduleDetailsValue}>
                {formatDate(data.createdAt)}
              </span>
            </Typography>
            <Typography className={classes.scheduleDetailsFlex}>
              <span className={classes.boldText}>
                {t('chaosWorkflows.browseSchedules.lastUpdated')} :
              </span>
              <span className={classes.scheduleDetailsValue}>
                {timeDifferenceForDate(data.updatedAt)}
              </span>
            </Typography>
            <Typography className={classes.scheduleDetailsFlex}>
              <span className={classes.boldText}>
                {t('chaosWorkflows.browseSchedules.regularity')} :
              </span>
              <span className={classes.scheduleDetailsValue}>
                {data.cronSyntax === ''
                  ? `${t('chaosWorkflows.browseSchedules.regularityOnce')}`
                  : validateCronSyntax(data.cronSyntax as string)}
              </span>
            </Typography>
          </div>
        </Popover>
      </TableCell>
      <TableCell>
        <span
          className={
            YAML.parse(data.workflowManifest).spec.suspend === true
              ? classes.dark
              : ''
          }
        >
          {YAML.parse(data.workflowManifest).spec.suspend === true ? (
            <Typography>
              {t('chaosWorkflows.browseSchedules.scheduleIsDisabled')}
            </Typography>
          ) : data.cronSyntax !== '' ? (
            <Typography>
              {moment(validateCronParser(data.cronSyntax)).format(
                'MMMM Do YYYY, h:mm:ss a'
              )}
            </Typography>
          ) : (
            <Typography>
              {t('chaosWorkflows.browseSchedules.nonCron')}
            </Typography>
          )}
        </span>
      </TableCell>

      <TableCell>
        <IconButton
          onClick={() => {
            tabs.changeWorkflowsTabs(1);
            setWorkflowName(data.workflowName);
          }}
          data-cy="showSchedules"
        >
          <div>
            <Icon name="workflow" />
            <Typography className={classes.runs}>
              {t('chaosWorkflows.browseSchedules.runs')}
            </Typography>
          </div>
        </IconButton>
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
                  {t('chaosWorkflows.browseSchedules.editSchedule')}
                </Typography>
              </div>
            </MenuItem>
          ) : (
            <></>
          )}
          {projectRole !== 'Viewer' && data.cronSyntax === '' ? (
            <MenuItem
              value="Rerun_Schedule"
              data-cy="rerunSchedule"
              onClick={() => reRunSchedule()}
            >
              <div className={classes.expDiv}>
                <ReplayIcon className={classes.rerunBtn} />
                <Typography data-cy="reRunSchedule" className={classes.btnText}>
                  {t('chaosWorkflows.browseSchedules.reRunSchedule')}
                </Typography>
              </div>
            </MenuItem>
          ) : (
            <></>
          )}
          <Snackbar
            open={displayReRunAlert}
            autoHideDuration={6000}
            onClose={handleAlertOnClose}
            data-cy="templateAlert"
          >
            <Alert onClose={handleAlertOnClose} severity="error">
              {reRunMessage}
            </Alert>
          </Snackbar>
          {projectRole !== 'Viewer' &&
            data.cronSyntax !== '' &&
            YAML.parse(data.workflowManifest).spec.suspend !== true && (
              <MenuItem
                value="Disable"
                onClick={() => {
                  handleToggleSchedule(data);
                }}
              >
                <div className={classes.expDiv}>
                  <img
                    src="./icons/disableSchedule.svg"
                    alt="Delete Schedule"
                    className={classes.btnImg}
                  />
                  <Typography
                    data-cy="disableSchedule"
                    className={classes.downloadText}
                  >
                    {t('chaosWorkflows.browseSchedules.disableSchedule')}
                  </Typography>
                </div>
              </MenuItem>
            )}

          {projectRole !== 'Viewer' &&
            YAML.parse(data.workflowManifest).spec.suspend === true && (
              <MenuItem
                value="Enable"
                onClick={() => {
                  handleToggleSchedule(data);
                }}
              >
                <div className={classes.expDiv}>
                  <img
                    src="./icons/disableSchedule.svg"
                    alt="Enable Schedule"
                    className={classes.btnImg}
                  />
                  <Typography
                    data-cy="enableSchedule"
                    className={classes.downloadText}
                  >
                    {t('chaosWorkflows.browseSchedules.enableSchedule')}
                  </Typography>
                </div>
              </MenuItem>
            )}
          <MenuItem
            value="Download"
            onClick={() =>
              downloadYAML(data.workflowManifest, data.workflowName)
            }
          >
            <div className={classes.expDiv}>
              <GetAppIcon className={classes.downloadBtn} />
              <Typography
                data-cy="downloadManifest"
                className={classes.downloadText}
              >
                {t('chaosWorkflows.browseSchedules.downloadManifest')}
              </Typography>
            </div>
          </MenuItem>
          <MenuItem
            value="SaveTemplate"
            data-cy="saveTemplate"
            onClick={() => handleSaveWorkflowTemplate(data.workflowManifest)}
          >
            <div className={classes.expDiv}>
              <InsertDriveFileOutlined className={classes.downloadBtn} />
              <Typography className={classes.downloadText}>
                {t('chaosWorkflows.browseSchedules.saveTemplate')}
              </Typography>
            </div>
          </MenuItem>
          {projectRole !== 'Viewer' ? (
            <MenuItem value="Analysis" onClick={() => setIsModalOpen(true)}>
              <div className={classes.expDiv}>
                <img
                  src="./icons/deleteSchedule.svg"
                  alt="Delete Schedule"
                  className={classes.btnImg}
                />
                <Typography
                  data-cy="deleteSchedule"
                  className={classes.btnText}
                >
                  {data.cronSyntax !== ''
                    ? t('chaosWorkflows.browseSchedules.deleteSchedule')
                    : t('chaosWorkflows.browseSchedules.deleteWorkflow')}
                </Typography>
              </div>
            </MenuItem>
          ) : null}
        </Menu>
      </TableCell>
      {isModalOpen ? (
        <Modal
          open={isModalOpen}
          onClose={handleClose}
          width="60%"
          modalActions={
            <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
          }
        >
          <div className={classes.modalDiv}>
            <CrossMarkIcon />
            <Typography className={classes.modalHeader}>
              {t('createWorkflow.scheduleWorkflow.modalHeader')}
            </Typography>
            <Typography className={classes.modalConfirm}>
              {t('createWorkflow.scheduleWorkflow.modalSubheader')}
            </Typography>
            <div className={classes.modalBtns} data-cy="deleteScheduleButtons">
              <ButtonOutlined onClick={() => setIsModalOpen(false)}>
                {t('createWorkflow.scheduleWorkflow.cancelBtn')}
              </ButtonOutlined>
              <ButtonFilled
                variant="error"
                className={classes.w7}
                onClick={() => {
                  deleteRow(data.workflowID);
                  setIsModalOpen(false);
                }}
              >
                {t('createWorkflow.scheduleWorkflow.deleteBtn')}
              </ButtonFilled>
            </div>
          </div>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};
export default TableData;
