/* eslint-disable */
import { Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import { RootState } from '../../../redux/reducers';
import timeDifference from '../../../utils/datesModifier';
import useStyles from './styles';

interface WorkflowNodeInfoProps {
  cluster_id: string;
  workflow_run_id: string;
  namespace: string;
}

const WorkflowNodeInfo: React.FC<WorkflowNodeInfoProps> = ({
  cluster_id,
  workflow_run_id,
  namespace,
}) => {
  const classes = useStyles();

  // Get the nelected node from redux
  const selectedNode = useSelector((state: RootState) => state.selectedNode);
  console.log(
    cluster_id,
    workflow_run_id,
    namespace,
    selectedNode.pod_name,
    selectedNode.type
  );

  return (
    <div className={classes.root}>
      {/* Node Name */}
      <div className={classes.heightMaintainer}>
        <Typography className={classes.nodeSpacing}>
          <span className={classes.bold}>Node name:</span>
          <br />
          {selectedNode.name}
        </Typography>
      </div>
      <hr />

      {/* Node Phase */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Phase:</span> {selectedNode.phase}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Node Durations */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Start time:</span>{' '}
            {timeDifference(selectedNode.startedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>End time:</span>{' '}
            {timeDifference(selectedNode.finishedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>Duration: </span>{' '}
            {(
              (parseInt(selectedNode.finishedAt, 10) -
                parseInt(selectedNode.startedAt, 10)) /
              60
            ).toFixed(1)}{' '}
            minutes
          </Typography>
        </div>
      </div>
      <div className={classes.footerButton}>
        <ButtonOutline isDisabled={false} handleClick={() => {}}>
          Logs
        </ButtonOutline>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
