import { useQuery } from '@apollo/client';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React, { useState } from 'react';
import YAML from 'yaml';
import Loader from '../../../../../components/Loader';
import Center from '../../../../../containers/layouts/Center';
import { WORKFLOW_LIST_DETAILS_FOR_MANIFEST } from '../../../../../graphql';
import { WorkflowRun } from '../../../../../models/graphql/workflowData';
import {
  WorkflowList,
  WorkflowListDataVars,
} from '../../../../../models/graphql/workflowListData';
import { history } from '../../../../../redux/configureStore';
import timeDifferenceForDate from '../../../../../utils/datesModifier';
import {
  getProjectID,
  getProjectRole,
} from '../../../../../utils/getSearchParams';
import useStyles from './styles';

interface WorkflowRunCardProps {
  data: WorkflowRun;
}

const WorkflowRunCard: React.FC<WorkflowRunCardProps> = ({ data }) => {
  const classes = useStyles();

  const projectID = getProjectID();
  const projectRole = getProjectRole();
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

  return (
    <div className={classes.workflowDataContainer}>
      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <>
          <div>
            <div id="statusDiv">
              <svg viewBox="0 0 10 10">
                <circle />
              </svg>
              <div>
                <Typography id="testName">{data.workflow_name}</Typography>
                <Typography id="hint">{data.cluster_name}</Typography>
              </div>
            </div>
          </div>

          <div>
            <Typography id="hint">Overall resilience rate:</Typography>
            <Typography>
              {JSON.parse(data.execution_data).resiliency_score}
            </Typography>
          </div>

          <div>
            <Typography id="hint">Last Run:</Typography>
            <Typography>{timeDifferenceForDate(data.last_updated)}</Typography>
          </div>
          <IconButton onClick={handleClick}>
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
            <List component="nav" aria-label="main mailbox folders">
              <ListItem
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
                <ListItemText primary="Show the analytics" />
              </ListItem>
              <ListItem
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
                <ListItemText primary="Download manifest" />
              </ListItem>
            </List>
          </Popover>
        </>
      )}
    </div>
  );
};

export { WorkflowRunCard };
