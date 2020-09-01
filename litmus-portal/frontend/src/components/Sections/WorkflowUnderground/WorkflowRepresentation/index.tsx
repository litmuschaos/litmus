import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { ExecutionData } from '../../../../models/workflowData';
import timeDifference from '../../../../utils/datesModifier';
import useStyles from './styles';

interface WorkflowRepresentationProps {
  workflow_name: string;
  execution_data: string;
  cluster_name: string;
}

interface SidebarState extends ExecutionData {
  current_running_node: string[];
  executed_nodes: string[];
}

const SideBar: React.FC<WorkflowRepresentationProps> = ({
  workflow_name,
  execution_data,
  cluster_name,
}) => {
  const classes = useStyles();

  const [duration, setDuration] = useState<number>(0);
  const [data, setData] = useState<SidebarState>({
    creationTimestamp: '',
    event_type: '',
    finishedAt: '',
    name: '',
    namespace: '',
    nodes: {},
    current_running_node: [],
    executed_nodes: [],
    phase: '',
    startedAt: '',
    uid: '',
  });

  useEffect(() => {
    if (execution_data !== undefined) {
      const execData = JSON.parse(execution_data) as ExecutionData;

      // Setting initial data to the data received from query/subscription
      setData({
        ...data,
        ...execData,
      });
    }
  }, [(JSON.parse(execution_data) as ExecutionData).phase]);

  useEffect(() => {
    setDuration(
      (parseInt(data.finishedAt, 10) - parseInt(data.startedAt, 10)) / 60
    );

    // If the Workflow is Running [Data is being received through Subscription]
    // Set the currently executed node in a local state
    if (data.phase === 'Running' && data.nodes !== undefined) {
      const currentlyRunningNodes: string[] = [];

      for (const val of Object.values(data.nodes)) {
        if (val.type !== 'StepGroup' && val.phase === 'Running') {
          currentlyRunningNodes.push(val.name);
        }
        setData({
          ...data,
          current_running_node: [
            ...data.executed_nodes,
            ...currentlyRunningNodes,
          ],
        });
      }
    } else {
      // If the Workflow has Succeeded or Failed
      // Store all the executed nodes in an array
      const executedNodes: string[] = [];

      for (const val of Object.values(data.nodes)) {
        let { name } = val;
        if (val.name.charAt(0) === '[') {
          name = `Step Group ${val.name.substring(1, val.name.length - 1)}`;
        }
        executedNodes.push(name);
        setData({
          ...data,
          executed_nodes: [...data.executed_nodes, ...executedNodes],
        });
      }
    }
  }, [data.nodes]);

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
            <span className={classes.bold}>State:</span> {data.phase}
          </Typography>
          <Typography>
            <span className={classes.bold}>Start time:</span>{' '}
            {timeDifference(data.startedAt)}
          </Typography>
          {data.phase !== 'Running' ? (
            <>
              <Typography>
                <span className={classes.bold}>End time:</span>{' '}
                {timeDifference(data.finishedAt)}
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
            <span className={classes.bold}>Namespace:</span> {data.namespace}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Workflow Node Details
      @param Currently Running Node
      @param Executed Nodes */}

      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          {data.phase === 'Running' ? (
            <Typography>
              <span className={classes.bold}>Currently Running Nodes:</span>{' '}
              <ul>
                {data.current_running_node.map((node) => {
                  return <li key={node}>{node}</li>;
                })}
              </ul>
            </Typography>
          ) : (
            <Typography>
              <span className={classes.bold}>Executed Nodes:</span>{' '}
              <ul>
                {data.executed_nodes.map((node) => {
                  return <li key={node}>{node}</li>;
                })}
              </ul>
            </Typography>
          )}
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

export default SideBar;
