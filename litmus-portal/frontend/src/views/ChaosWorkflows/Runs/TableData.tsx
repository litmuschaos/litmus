import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TableCell,
  Typography,
  useTheme,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  ButtonFilled,
  ButtonOutlined,
  Icon,
  Modal,
  OutlinedPills,
} from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TimePopOver from '../../../components/TimePopOver';
import {
  DELETE_WORKFLOW,
  GET_WORKFLOW_DETAILS,
  SYNC_WORKFLOW,
  TERMINATE_WORKFLOW,
} from '../../../graphql';
import { WorkflowRun } from '../../../models/graphql/workflowData';
import {
  GetWorkflowsRequest,
  ScheduledWorkflows,
} from '../../../models/graphql/workflowListData';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import ExperimentPoints from '../BrowseSchedule/ExperimentPoints';
import ManifestModal from './ManifestModal';
import useStyles from './styles';

interface TableDataProps {
  data: Partial<WorkflowRun>;
  refetchQuery: any;
}

const TableData: React.FC<TableDataProps> = ({ data, refetchQuery }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const nodeSelection = useActions(NodeSelectionActions);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [manifestModal, setManifestModal] = React.useState(false);

  // Function to capitalize the first letter of the word
  // eg: internal to Internal
  const nameCapitalized = (clusterType: string) => {
    if (clusterType)
      return clusterType.charAt(0).toUpperCase() + clusterType.slice(1);
    return 'Not Available';
  };

  const { data: scheduledWorkflowData } = useQuery<
    ScheduledWorkflows,
    GetWorkflowsRequest
  >(GET_WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
        workflowIDs: [data.workflowID ?? ''],
      },
    },
  });

  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

  /**
   * State variables for warning popover
   */
  const [popWarningAnchorEl, setWarningPopAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const isWarningOpen = Boolean(popWarningAnchorEl);
  const idWarning = isWarningOpen ? 'simple-popover' : undefined;
  const handleWarningPopOverClose = () => {
    setWarningPopAnchorEl(null);
  };
  const handleWarningPopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setWarningPopAnchorEl(event.currentTarget);
  };

  /**
   * Sync workflow to sync a chaos workflow
   */
  const [syncWorkflow] = useMutation(SYNC_WORKFLOW, {
    onCompleted: (data) => {
      if (data?.syncWorkflowRun) {
        handleWarningPopOverClose();
        refetchQuery();
      }
    },
  });

  /**
   * Delete workflow mutation to delete a chaos workflow
   */
  const [deleteWorkflow] = useMutation(DELETE_WORKFLOW, {
    onCompleted: (data) => {
      if (data?.deleteChaosWorkflow) {
        handleWarningPopOverClose();
        refetchQuery();
      }
    },
  });

  /**
   * Terminate workflow terminates the workflow from the cluster
   */
  const [terminateWorkflow] = useMutation(TERMINATE_WORKFLOW, {
    onCompleted: (data) => {
      if (data?.terminateChaosWorkflow) {
        refetchQuery();
      }
    },
  });

  function getResiliencyScoreColor(score: number) {
    if (score < 39) {
      return classes.less;
    }
    if (score > 40 && score < 79) {
      return classes.medium;
    }
    return classes.high;
  }

  // Function to find the time different in minutes
  const timeDiff = (currentTime: number, lastUpdated: string) => {
    const current = currentTime;
    const last = parseInt(lastUpdated, 10) * 1000;
    const timeDifference = (current - last) / (60 * 1000);
    return timeDifference;
  };

  const getVariant = (variant: string | undefined) => {
    switch (variant) {
      case 'succeeded':
        return 'succeeded';
      case 'failed':
        return 'failed';
      case 'running':
        return 'running';
      default:
        return 'pending';
    }
  };

  const handleCloseManifest = () => {
    setManifestModal(false);
  };

  return (
    <>
      {/* Table cell for warning (if the workflow is in running state from 20 mins) */}
      <TableCell className={classes.warningTableCell}>
        {timeDiff(new Date().getTime(), data.lastUpdated ?? '') >= 20 &&
        data.phase?.toLowerCase() === 'running' ? (
          <IconButton onClick={handleWarningPopOverClick}>
            <img src="./icons/warning.svg" alt="warning" width="20" />
          </IconButton>
        ) : (
          <></>
        )}
        {/* Warning PopOver */}
        <Popover
          id={idWarning}
          open={isWarningOpen}
          anchorEl={popWarningAnchorEl}
          onClose={handleWarningPopOverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className={classes.popoverWarning}>
            <Typography>
              {t('chaosWorkflows.browseWorkflows.wfIssue')}
            </Typography>
            <div className={classes.imageRunning}>
              <img
                src="./icons/running.svg"
                alt="running"
                className={classes.runningSmallIcon}
              />{' '}
              <Typography className={classes.runningText}>
                {t('chaosWorkflows.browseWorkflows.runningFrom')}{' '}
                {Math.round(
                  timeDiff(new Date().getTime(), data.lastUpdated ?? '')
                )}{' '}
                {t('chaosWorkflows.browseWorkflows.min')}
              </Typography>
            </div>
            {/* Buttons to sync and terminate the workflow */}
            <div className={classes.warningBtnDiv}>
              <ButtonFilled
                className={classes.syncBtn}
                onClick={() => {
                  syncWorkflow({
                    variables: {
                      projectID: getProjectID(),
                      workflowID: data.workflowID,
                      workflowRunID: data.workflowRunID,
                    },
                  });
                }}
              >
                <img src="./icons/sync-wf.svg" alt="sync" />
                <Typography className={classes.waitingBtnText}>
                  {t('chaosWorkflows.browseWorkflows.sync')}
                </Typography>
              </ButtonFilled>
              <ButtonFilled
                onClick={() => {
                  deleteWorkflow({
                    variables: {
                      projectID: getProjectID(),
                      workflowID: data.workflowID,
                      workflowRunID: data.workflowRunID,
                    },
                  });
                }}
                className={classes.terminateText}
              >
                <DeleteForeverIcon className={classes.deleteIcon} />
                <Typography className={classes.waitingBtnText}>
                  {t('chaosWorkflows.browseWorkflows.delete')}
                </Typography>
              </ButtonFilled>
            </div>
          </div>
        </Popover>
      </TableCell>
      <TableCell>
        <OutlinedPills
          size="small"
          variant={getVariant(data.phase?.toLowerCase())}
          label={data.phase ?? ''}
          data-cy="WorkflowStatus"
        />
      </TableCell>
      <TableCell
        className={classes.workflowNameData}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          nodeSelection.selectNode({
            podName: '',
          });
          history.push({
            pathname: `/scenarios/${data.workflowRunID}`,
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          });
        }}
      >
        <Typography className={classes.boldText} data-cy="workflowName">
          {data.workflowName}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>
          {nameCapitalized(data.clusterName ?? '')}
        </Typography>
      </TableCell>
      <TableCell className={classes.reliabiltyData}>
        {scheduledWorkflowData?.listWorkflows.workflows[0]?.weightages[0]
          ?.experimentName !== '' ? (
          <>
            <Typography data-cy="ResScore">
              <span>
                {t('chaosWorkflows.browseWorkflows.tableData.overallRR')}
              </span>
              {data.resiliencyScore === undefined ||
              data.resiliencyScore === null ? (
                <span className={classes.less}>
                  {t('chaosWorkflows.browseWorkflows.tableData.na')}
                </span>
              ) : (
                <span
                  className={`${classes.boldText} ${getResiliencyScoreColor(
                    data.resiliencyScore
                  )}`}
                >
                  {data.resiliencyScore}%
                </span>
              )}
            </Typography>
            <Typography data-cy="ExperimentsPassed">
              <span>
                {t(
                  'chaosWorkflows.browseWorkflows.tableData.experimentsPassed'
                )}
              </span>
              {data.experimentsPassed === undefined ||
              data.experimentsPassed === null ||
              data.totalExperiments === undefined ||
              data.totalExperiments === null ||
              data.totalExperiments === 0 ||
              data.resiliencyScore === undefined ||
              data.resiliencyScore === null ? (
                <span className={classes.less}>
                  {t('chaosWorkflows.browseWorkflows.tableData.na')}
                </span>
              ) : (
                <span
                  className={`${classes.boldText} ${getResiliencyScoreColor(
                    data.resiliencyScore
                  )}`}
                >
                  {data.experimentsPassed}/{data.totalExperiments}
                </span>
              )}
            </Typography>
          </>
        ) : (
          <Typography style={{ marginLeft: 30 }}>
            {t('chaosWorkflows.browseWorkflows.tableData.na')}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <div>
          {scheduledWorkflowData?.listWorkflows.workflows[0]?.weightages[0]
            ?.experimentName !== '' ? (
            <>
              <Button
                onClick={handlePopOverClick}
                className={classes.buttonTransform}
              >
                <Typography className={classes.boldText}>
                  {t(
                    'chaosWorkflows.browseWorkflows.tableData.showExperiments'
                  )}
                  (
                  {scheduledWorkflowData?.listWorkflows.workflows[0]?.weightages
                    .length ?? 0}
                  )
                </Typography>
                <div className={classes.experimentDetails}>
                  {isOpen ? (
                    <KeyboardArrowDownIcon className={classes.arrowMargin} />
                  ) : (
                    <ChevronRightIcon className={classes.arrowMargin} />
                  )}
                </div>
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
                <div className={classes.popover}>
                  {scheduledWorkflowData?.listWorkflows.workflows[0]?.weightages.map(
                    (weightEntry) => (
                      <div
                        key={weightEntry.experimentName}
                        style={{ marginBottom: 8 }}
                      >
                        <ExperimentPoints
                          expName={weightEntry.experimentName}
                          weight={weightEntry.weightage}
                        />
                      </div>
                    )
                  )}
                </div>
              </Popover>
            </>
          ) : (
            <Typography style={{ marginLeft: 30 }}>
              {t('chaosWorkflows.browseWorkflows.tableData.na')}
            </Typography>
          )}
        </div>
      </TableCell>
      <TableCell>
        <TimePopOver unixTime={data.lastUpdated ?? ''} />
      </TableCell>
      <TableCell>
        <Typography className={classes.executedBy}>
          {data.executedBy || '-'}
        </Typography>
      </TableCell>
      <TableCell>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={classes.optionBtn}
          data-cy="browseWorkflowOptions"
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
            value="Scenario"
            onClick={() => {
              nodeSelection.selectNode({
                podName: '',
              });
              history.push({
                pathname: `/scenarios/${data.workflowRunID}`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowDetails">
              <img
                src="./icons/show-workflow.svg"
                alt="Display Scenario"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                {t('chaosWorkflows.browseWorkflows.tableData.showTheWorkflow')}
              </Typography>
            </div>
          </MenuItem>
          <MenuItem
            value="Analysis"
            onClick={() => {
              history.push({
                pathname: `/analytics/scenarioStatistics/${data.workflowID}`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowStatistics">
              <img
                src="./icons/show-statistics.svg"
                alt="Display Statistics"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                {t(
                  'chaosWorkflows.browseWorkflows.tableData.showTheStatistics'
                )}
              </Typography>
            </div>
          </MenuItem>
          <MenuItem
            value="ViewScenario"
            onClick={() => {
              setManifestModal(true);
            }}
          >
            <div className={classes.expDiv} data-cy="viewWorkflow">
              <Icon name="document" color={`${theme.palette.common.black}`} />
              <Typography className={classes.btnText}>
                {t('chaosWorkflows.browseWorkflows.tableData.viewManifest')}
              </Typography>
            </div>
          </MenuItem>
          <Modal
            width="60%"
            open={manifestModal}
            onClose={handleCloseManifest}
            disableBackdropClick
            modalActions={
              <ButtonOutlined onClick={handleCloseManifest}>
                &#x2715;
              </ButtonOutlined>
            }
          >
            <ManifestModal projectID={projectID} workflowID={data.workflowID} />
          </Modal>
          {data.phase?.toLowerCase() === 'running' && (
            <MenuItem
              value="Terminate"
              onClick={() => {
                terminateWorkflow({
                  variables: {
                    projectID: getProjectID(),
                    workflowID: data.workflowID,
                    workflowRunID: data.workflowRunID,
                  },
                });
              }}
            >
              <div className={classes.expDiv} data-cy="terminateWorkflow">
                <img
                  src="./icons/terminate-wf-dark.svg"
                  alt="Terminate Chaos Scenario"
                  className={classes.terminateImg}
                />
                <Typography className={classes.btnText}>
                  {t('chaosWorkflows.browseWorkflows.terminate')}
                </Typography>
              </div>
            </MenuItem>
          )}
        </Menu>
      </TableCell>
    </>
  );
};
export default TableData;
