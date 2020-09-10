/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: remove this after creating UI for node details sidebar
import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ExecutionData } from '../../../../models/graphql/workflowData';
import { RootState } from '../../../../redux/reducers';
import timeDifference from '../../../../utils/datesModifier';
import useStyles from './styles';

interface WorkflowInfoProps {
  workflow_name: string;
  execution_data: ExecutionData;
  cluster_name: string;
}

interface SidebarState {
  currentRunningNodes: string[];
  executedNodes: string[];
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  workflow_name,
  execution_data,
  cluster_name,
}) => {
  const classes = useStyles();
  // Get selected node data from redux
  const selectedNode = useSelector((state: RootState) => state.selectedNode);

  const [duration, setDuration] = useState<number>(0);
  const [data, setData] = useState<SidebarState>({
    currentRunningNodes: [],
    executedNodes: [],
  });

  useEffect(() => {
    setDuration(
      (parseInt(execution_data.finishedAt, 10) -
        parseInt(execution_data.startedAt, 10)) /
        60
    );

    // If the Workflow is Running [Data is being received through Subscription]
    // Set the currently executed node in a local state
    const executedNodes: string[] = [];
    const currentRunningNodes: string[] = [];

    for (const val of Object.values(execution_data.nodes))
      if (val.type !== 'StepGroup' && val.phase === 'Running')
        currentRunningNodes.push(val.name);
      else if (val.type !== 'StepGroup' && val.phase === 'Succeeded')
        executedNodes.push(val.name);

    setData({
      ...data,
      currentRunningNodes,
      executedNodes,
    });
  }, [execution_data.nodes, execution_data.phase]);

  return (
    <div className={classes.root}>
      {/* Workflow Information */}
      <Typography className={classes.header} variant="h6">
        <span className={classes.bold}>Workflow Information</span>
      </Typography>
      <hr className={classes.divider} />
      <div className={classes.heightMaintainer}>
        <Typography className={classes.workflowSpacing}>
          <span className={classes.bold}>Workflow name:</span>
          <br />
          {workflow_name}
        </Typography>
      </div>
      <hr />

      {/* Workflow Details
      @param State
      @param Start Time
      @param End Time
      @param Duration
      @param Namespace */}

      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>State:</span> {execution_data.phase}
          </Typography>
          <Typography>
            <span className={classes.bold}>Start time:</span>{' '}
            {timeDifference(execution_data.startedAt)}
          </Typography>
          {execution_data.phase !== 'Running' ? (
            <>
              <Typography>
                <span className={classes.bold}>End time:</span>{' '}
                {timeDifference(execution_data.finishedAt)}
              </Typography>
              <Typography>
                <span className={classes.bold}>Duration:</span>{' '}
                {`${duration.toFixed(1)} minutes`}
              </Typography>
            </>
          ) : (
            <></>
          )}
          <Typography>
            <span className={classes.bold}>Namespace:</span>{' '}
            {execution_data.namespace}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Workflow Node Details
      @param Currently Running Node
      @param Executed Nodes */}

      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          {execution_data.phase === 'Running' ? (
            <Typography>
              <span className={classes.bold}>Currently Running Nodes:</span>{' '}
              <ul>
                {data.currentRunningNodes.map((node) => (
                  <li key={node}>{node}</li>
                ))}
              </ul>
            </Typography>
          ) : (
            <></>
          )}
          <Typography>
            <span className={classes.bold}>Executed Nodes:</span>{' '}
            {data.executedNodes.length ? (
              <ul>
                {data.executedNodes.map((node) => (
                  <li key={node}>{node}</li>
                ))}
              </ul>
            ) : (
              <Typography>No executed nodes</Typography>
            )}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Cluster Details
      @param Cluster Name */}

      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Cluster:</span> {cluster_name}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
