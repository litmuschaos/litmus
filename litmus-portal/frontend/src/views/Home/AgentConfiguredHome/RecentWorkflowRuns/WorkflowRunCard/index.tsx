import { useQuery } from '@apollo/client';
import {
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import Loader from '../../../../../components/Loader';
import Center from '../../../../../containers/layouts/Center';
import { WORKFLOW_LIST_DETAILS_FOR_MANIFEST } from '../../../../../graphql';
import { WorkflowRun } from '../../../../../models/graphql/workflowData';
import {
  WorkflowList,
  WorkflowListDataVars,
} from '../../../../../models/graphql/workflowListData';
import useActions from '../../../../../redux/actions';
import * as NodeSelectionActions from '../../../../../redux/actions/nodeSelection';
import { history } from '../../../../../redux/configureStore';
import timeDifferenceForDate from '../../../../../utils/datesModifier';
import {
  getProjectID,
  getProjectRole,
} from '../../../../../utils/getSearchParams';
import {
  FAILED,
  PENDING,
  RUNNING,
  SUCCEEDED,
} from '../../../../WorkflowDetails/workflowConstants';
import useStyles from './styles';

interface WorkflowRunCardProps {
  data: WorkflowRun;
}

const WorkflowRunCard: React.FC<WorkflowRunCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const nodeSelection = useActions(NodeSelectionActions);

  // Popover Logic

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Handle clicks
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'homeWorkflowDropdown' : undefined;

  function getPhaseVariant(variant: string): string {
    switch (variant) {
      case SUCCEEDED:
        return classes.succeeded;
      case RUNNING:
        return classes.running;
      case FAILED:
        return classes.failed;
      case PENDING:
        return classes.pending;
      default:
        return classes.pending;
    }
  }

  function getResiliencyScoreVariant(score: number) {
    if (score <= 40) {
      return classes.lowScore;
    }
    if (score > 40 && score < 79) {
      return classes.mediumScore;
    }
    return classes.highScore;
  }

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

  const { data: manifestDetails, loading } = useQuery<
    WorkflowList,
    WorkflowListDataVars
  >(WORKFLOW_LIST_DETAILS_FOR_MANIFEST, {
    variables: { projectID, workflowIDs: [data.workflow_id as string] },
    fetchPolicy: 'cache-and-network',
  });

  const executionData = JSON.parse(data.execution_data);

  return (
    <div className={classes.workflowDataContainer}>
      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <>
          <Link
            underline="none"
            color="initial"
            onClick={() => {
              nodeSelection.selectNode({
                pod_name: '',
              });
              history.push({
                pathname: `/workflows/${data.workflow_run_id}`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            title={t(
              'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.cardTitle'
            )}
          >
            <div>
              <div id="statusDiv">
                <svg viewBox="0 0 10 10">
                  <circle className={getPhaseVariant(executionData.phase)} />
                </svg>
                <div>
                  <Typography id="testName" className={classes.noWrapProvider}>
                    {data.workflow_name}
                  </Typography>
                  <Typography id="hint">{data.cluster_name}</Typography>
                </div>
              </div>
            </div>
          </Link>

          <div>
            <Typography id="hint">
              {t(
                'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.resilienceRate'
              )}
            </Typography>
            <Typography
              className={getResiliencyScoreVariant(
                executionData.resiliency_score
              )}
            >
              {executionData.resiliency_score
                ? `${executionData.resiliency_score}%`
                : '--'}
            </Typography>
          </div>

          <div>
            <Typography id="hint">
              {t(
                'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.lastRun'
              )}
            </Typography>
            <Typography
              className={`${classes.noWrapProvider} ${classes.lastRunTime}`}
            >
              {timeDifferenceForDate(data.last_updated)}
            </Typography>
          </div>
          <IconButton
            className={`${open ? classes.moreHorizIconsIsSelected : ''}`}
            style={{
              backgroundColor: 'transparent',
            }}
            onClick={handleClick}
          >
            <MoreHorizIcon />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <List component="nav" className={classes.listContainer}>
              <ListItem
                autoFocus
                className={classes.listItem}
                button
                onClick={() => {
                  history.push({
                    pathname: `/workflows/analytics/${data.workflow_id}`,
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
                <ListItemIcon>
                  <img src="./icons/show-analytics.svg" alt="Show analytics" />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.showAnalytics'
                  )}
                />
              </ListItem>
              <ListItem
                className={classes.listItem}
                button
                onClick={() =>
                  manifestDetails &&
                  downloadYAML(
                    manifestDetails.ListWorkflow[0].workflow_manifest,
                    manifestDetails.ListWorkflow[0].workflow_name
                  )
                }
              >
                <ListItemIcon>
                  <img src="./icons/download.svg" alt="Download manifest" />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.downloadManifest'
                  )}
                />
              </ListItem>
            </List>
          </Popover>
        </>
      )}
    </div>
  );
};

export { WorkflowRunCard };
