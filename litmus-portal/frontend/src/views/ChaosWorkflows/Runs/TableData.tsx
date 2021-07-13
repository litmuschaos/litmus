import { useMutation, useQuery } from '@apollo/client';
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
import { ButtonFilled, OutlinedPills } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TimePopOver from '../../../components/TimePopOver';
import {
  DELETE_WORKFLOW,
  SYNC_WORKFLOW,
  WORKFLOW_LIST_DETAILS,
} from '../../../graphql';
import { WorkflowRun } from '../../../models/graphql/workflowData';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../../models/graphql/workflowListData';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import ExperimentPoints from '../BrowseSchedule/ExperimentPoints';
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const nodeSelection = useActions(NodeSelectionActions);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to capitalize the first letter of the word
  // eg: internal to Internal
  const nameCapitalized = (clusterType: string) => {
    if (clusterType)
      return clusterType.charAt(0).toUpperCase() + clusterType.slice(1);
    return 'Not Available';
  };

  const { data: scheduledWorkflowData } = useQuery<
    ScheduledWorkflows,
    ListWorkflowsInput
  >(WORKFLOW_LIST_DETAILS, {
    variables: {
      workflowInput: {
        project_id: projectID,
        workflow_ids: [data.workflow_id ?? ''],
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
      if (data.syncWorkflow) {
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
      if (data.deleteChaosWorkflow) {
        handleWarningPopOverClose();
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

  return (
    <>
      {/* Table cell for warning (if the workflow is in running state from 20 mins) */}
      <TableCell className={classes.warningTableCell}>
        {timeDiff(new Date().getTime(), data.last_updated ?? '') >= 20 &&
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
                  timeDiff(new Date().getTime(), data.last_updated ?? '')
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
                      workflowid: data.workflow_id,
                      workflow_run_id: data.workflow_run_id,
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
                      workflowid: data.workflow_id,
                      workflow_run_id: data.workflow_run_id,
                    },
                  });
                }}
                className={classes.terminateText}
              >
                <img src="./icons/terminate-wf.svg" alt="terminate" />
                <Typography className={classes.waitingBtnText}>
                  {t('chaosWorkflows.browseWorkflows.terminate')}
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
        />
      </TableCell>
      <TableCell
        className={classes.workflowNameData}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          nodeSelection.selectNode({
            pod_name: '',
          });
          if (data.phase?.toLowerCase() !== 'notavailable')
            history.push({
              pathname: `/workflows/${data.workflow_run_id}`,
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
        }}
      >
        <Typography className={classes.boldText} data-cy="workflowName">
          {data.workflow_name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.clusterName}>
          {nameCapitalized(data.cluster_name ?? '')}
        </Typography>
      </TableCell>
      <TableCell className={classes.reliabiltyData}>
        <Typography>
          <span>{t('chaosWorkflows.browseWorkflows.tableData.overallRR')}</span>
          {data.resiliency_score === undefined ||
          data.resiliency_score === null ? (
            <span className={classes.less}>
              {t('chaosWorkflows.browseWorkflows.tableData.na')}
            </span>
          ) : (
            <span
              className={`${classes.boldText} ${getResiliencyScoreColor(
                data.resiliency_score
              )}`}
            >
              {data.resiliency_score}%
            </span>
          )}
        </Typography>
        <Typography>
          <span>
            {t('chaosWorkflows.browseWorkflows.tableData.experimentsPassed')}
          </span>
          {data.experiments_passed === undefined ||
          data.experiments_passed === null ||
          data.total_experiments === undefined ||
          data.total_experiments === null ||
          data.resiliency_score === undefined ||
          data.resiliency_score === null ? (
            <span className={classes.less}>
              {t('chaosWorkflows.browseWorkflows.tableData.na')}
            </span>
          ) : (
            <span
              className={`${classes.boldText} ${getResiliencyScoreColor(
                data.resiliency_score
              )}`}
            >
              {data.experiments_passed}/{data.total_experiments}
            </span>
          )}
        </Typography>
      </TableCell>
      <TableCell>
        <div>
          <Button
            onClick={handlePopOverClick}
            className={classes.buttonTransform}
          >
            <Typography className={classes.boldText}>
              {t('chaosWorkflows.browseWorkflows.tableData.showExperiments')}(
              {scheduledWorkflowData?.ListWorkflow.workflows[0]?.weightages
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
              {scheduledWorkflowData?.ListWorkflow.workflows[0]?.weightages.map(
                (weightEntry) => (
                  <div
                    key={weightEntry.experiment_name}
                    style={{ marginBottom: 8 }}
                  >
                    <ExperimentPoints
                      expName={weightEntry.experiment_name}
                      weight={weightEntry.weightage}
                    />
                  </div>
                )
              )}
            </div>
          </Popover>
        </div>
      </TableCell>
      <TableCell>
        <TimePopOver unixTime={data.last_updated ?? ''} />
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
            value="Workflow"
            onClick={() => {
              nodeSelection.selectNode({
                pod_name: '',
              });
              if (data.phase?.toLowerCase() !== 'notavailable')
                history.push({
                  pathname: `/workflows/${data.workflow_run_id}`,
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowDetails">
              <img
                src="./icons/show-workflow.svg"
                alt="Display Workflow"
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
              if (data.phase?.toLowerCase() !== 'notavailable')
                history.push({
                  pathname: `/analytics/workflowdashboard/${data.workflow_id}`,
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowAnalytics">
              <img
                src="./icons/show-analytics.svg"
                alt="Display Analytics"
                className={classes.btnImg}
              />
              <Typography className={classes.btnText}>
                {t('chaosWorkflows.browseWorkflows.tableData.showTheAnalytics')}
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
