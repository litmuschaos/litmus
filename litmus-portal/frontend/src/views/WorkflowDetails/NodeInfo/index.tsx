import { Typography } from '@material-ui/core';
import React from 'react';
import { Node } from '../../../models/graphql/workflowData';
import timeDifference from '../../../utils/datesModifier';
import useStyles from './styles';

interface NodeInfoProps {
  nodeDetails: Node;
}

const WorkflowNodeInfo: React.FC<NodeInfoProps> = ({ nodeDetails }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {/* Node Name */}
      <div className={classes.heightMaintainer}>
        <Typography className={classes.nodeSpacing}>
          <span className={classes.bold}>Node name:</span>
          <br />
          {nodeDetails.name}
        </Typography>
      </div>
      <hr />

      {/* Node Phase */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Phase:</span> {nodeDetails.phase}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Node Durations */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>Start time:</span>{' '}
            {timeDifference(nodeDetails.startedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>End time:</span>{' '}
            {timeDifference(nodeDetails.finishedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>Duration: </span>{' '}
            {(
              (parseInt(nodeDetails.finishedAt, 10) -
                parseInt(nodeDetails.startedAt, 10)) /
              60
            ).toFixed(1)}{' '}
            minutes
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
