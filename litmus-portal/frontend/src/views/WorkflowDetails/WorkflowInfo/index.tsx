import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionData } from '../../../models/graphql/workflowData';
import timeDifference from '../../../utils/datesModifier';
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
  const { t } = useTranslation();
  // Get selected node data from redux

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
      <div className={classes.heightMaintainer}>
        <Typography className={classes.workflowSpacing}>
          <span className={classes.bold}>
            {t('workflowDetailsView.workflowInfo.header')}:
          </span>
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
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowInfo.param.state')}:
            </span>{' '}
            {execution_data.phase}
          </Typography>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowInfo.param.startTime')}:
            </span>{' '}
            {timeDifference(execution_data.startedAt)}
          </Typography>
          {execution_data.phase !== 'Running' ? (
            <>
              <Typography>
                <span className={classes.bold}>
                  {t('workflowDetailsView.workflowInfo.param.endTime')}:
                </span>{' '}
                {timeDifference(execution_data.finishedAt)}
              </Typography>
              <Typography>
                <span className={classes.bold}>
                  {t('workflowDetailsView.workflowInfo.param.duration')}:
                </span>{' '}
                {`${duration.toFixed(1)} minutes`}
              </Typography>
            </>
          ) : (
            <></>
          )}
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowInfo.param.namespace')}:
            </span>{' '}
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
              <span className={classes.bold}>
                {t('workflowDetailsView.workflowInfo.nodeDetails.curr')}:
              </span>{' '}
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
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowInfo.nodeDetails.exec')}:
            </span>{' '}
            {data.executedNodes.length ? (
              <ul>
                {data.executedNodes.map((node) => (
                  <li key={node}>{node}</li>
                ))}
              </ul>
            ) : (
              <Typography>
                {t('workflowDetailsView.workflowInfo.nodeDetails.noExec')}
              </Typography>
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
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowInfo.cluster')}:
            </span>{' '}
            {cluster_name}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
