import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TableCell,
  Typography,
} from '@material-ui/core';
import { useQuery } from '@apollo/client';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import React from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import {
  ExecutionData,
  WorkflowRun,
} from '../../../models/graphql/workflowData';
import { history } from '../../../redux/configureStore';
import timeDifferenceForDate from '../../../utils/datesModifier';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import CustomStatus from '../CustomStatus/Status';
import useStyles from './styles';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import { WORKFLOW_LIST_DETAILS } from '../../../graphql';
import {
  WorkflowList,
  WorkflowListDataVars,
} from '../../../models/graphql/workflowListData';
import ExperimentPoints from '../BrowseSchedule/ExperimentPoints';

interface TableDataProps {
  data: WorkflowRun;
  exeData: ExecutionData;
}

const TableData: React.FC<TableDataProps> = ({ data, exeData }) => {
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
    WorkflowList,
    WorkflowListDataVars
  >(WORKFLOW_LIST_DETAILS, {
    variables: {
      projectID,
      workflowIDs: [data.workflow_id as string],
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

  function getResiliencyScoreColor(score: number) {
    if (score < 39) {
      return classes.less;
    }
    if (score > 40 && score < 79) {
      return classes.medium;
    }
    return classes.high;
  }

  return (
    <>
      <TableCell className={classes.tableDataStatus}>
        <CustomStatus status={exeData.phase} />
      </TableCell>
      <TableCell
        className={classes.workflowNameData}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          nodeSelection.selectNode({
            pod_name: '',
          });
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
          {nameCapitalized(data.cluster_name)}
        </Typography>
      </TableCell>
      <TableCell className={classes.reliabiltyData}>
        <Typography>
          <span>{t('chaosWorkflows.browseWorkflows.tableData.overallRR')}</span>
          {!exeData.resiliency_score ? (
            <span className={classes.less}>
              {t('chaosWorkflows.browseWorkflows.tableData.na')}
            </span>
          ) : (
            <span
              className={`${classes.boldText} ${getResiliencyScoreColor(
                exeData.resiliency_score
              )}`}
            >
              {exeData.resiliency_score}%
            </span>
          )}
        </Typography>
        <Typography>
          <span>
            {t('chaosWorkflows.browseWorkflows.tableData.experimentsPassed')}
          </span>
          {!exeData.resiliency_score ? (
            <span className={classes.less}>
              {t('chaosWorkflows.browseWorkflows.tableData.na')}
            </span>
          ) : (
            <span
              className={`${classes.boldText} ${getResiliencyScoreColor(
                exeData.resiliency_score
              )}`}
            >
              {exeData.experiments_passed}/{exeData.total_experiments}
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
              {scheduledWorkflowData?.ListWorkflow[0].weightages.length})
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
              {scheduledWorkflowData?.ListWorkflow[0].weightages.map(
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
        <Typography>{timeDifferenceForDate(data.last_updated)}</Typography>
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
              history.push({
                pathname: `/workflows/${data.workflow_run_id}`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowDetails">
              <img
                src="/icons/show-workflow.svg"
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
              history.push({
                pathname: `/workflows/analytics/${data.workflow_id}`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            <div className={classes.expDiv} data-cy="workflowAnalytics">
              <img
                src="/icons/show-analytics.svg"
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
