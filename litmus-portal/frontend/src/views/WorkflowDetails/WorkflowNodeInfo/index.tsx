/* eslint-disable */
import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import { RootState } from '../../../redux/reducers';
import timeDifference from '../../../utils/datesModifier';
import NodeLogs from '../NodeLogs';
import useStyles from './styles';

interface WorkflowNodeInfoProps {
  cluster_id: string;
  workflow_run_id: string;
  pod_namespace: string;
}

const WorkflowNodeInfo: React.FC<WorkflowNodeInfoProps> = ({
  cluster_id,
  workflow_run_id,
  pod_namespace,
}) => {
  const classes = useStyles();
  const [logsOpen, setLogsOpen] = useState<boolean>(false);

  // Get the nelected node from redux
  const { name, phase, pod_name, type, startedAt, finishedAt } = useSelector(
    (state: RootState) => state.selectedNode
  );

  const handleClose = () => {
    setLogsOpen(false);
  };

  return (
    <div className={classes.root}>
      {/* Logs Modal */}
      {logsOpen ? (
        <NodeLogs
          logsOpen={logsOpen}
          handleClose={handleClose}
          cluster_id={cluster_id}
          workflow_run_id={workflow_run_id}
          pod_namespace={pod_namespace}
          pod_name={pod_name}
          pod_type={type}
        />
      ) : (
        <></>
      )}

      {/* Node Name */}
      <div className={classes.heightMaintainer}>
        <Typography className={classes.nodeSpacing}>
          <span className={classes.bold}>Name:</span>
          <br />
          {pod_name}
        </Typography>
      </div>
      {/* Node Type */}
      <div className={classes.heightMaintainer}>
        <Typography className={classes.nodeSpacing}>
          <span className={classes.bold}>Type:</span> {type}
        </Typography>
      </div>
      <hr />

      {/* Node Phase */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Phase:</span> {phase}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Node Durations */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Start time:</span>{' '}
            {timeDifference(startedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>End time:</span>{' '}
            {timeDifference(finishedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>Duration: </span>{' '}
            {(
              (parseInt(finishedAt, 10) - parseInt(startedAt, 10)) /
              60
            ).toFixed(1)}{' '}
            minutes
          </Typography>
        </div>
      </div>
      <hr />
      {/* Node Name */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Node Name:</span> {name}
          </Typography>
        </div>
      </div>
      <div className={classes.footerButton}>
        <ButtonOutline isDisabled={false} handleClick={() => setLogsOpen(true)}>
          Logs
        </ButtonOutline>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
