/* eslint-disable camelcase */

import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';
import timeDifference from '../../../../utils/datesModifier';

interface SideBarProps {
  workflow_run_id?: string;
  workflow_name: string | undefined;
  last_updated?: string;
  execution_data: string;
  cluster_name: string;
}

const SideBar: React.FC<SideBarProps> = ({
  workflow_name,
  execution_data,
  cluster_name,
}) => {
  const classes = useStyles();

  const [duration, setDuration] = useState<number>(0);
  const [data, setData] = useState<any>({
    creationTimestamp: '',
    event_type: '',
    finishedAt: '',
    name: '',
    namespace: '',
    node: '',
    phase: '',
    startedAt: '',
    uid: '',
  });

  useEffect(() => {
    if (execution_data !== undefined) {
      const {
        creationTimestamp,
        event_type,
        finishedAt,
        name,
        namespace,
        node,
        phase,
        startedAt,
        uid,
      } = JSON.parse(execution_data);
      setData({
        creationTimestamp,
        event_type,
        finishedAt,
        name,
        namespace,
        node,
        phase,
        startedAt,
        uid,
      });
      setDuration(
        parseInt(timeDifference(data.startedAt).split(' ')[0], 10) -
          parseInt(timeDifference(data.finishedAt).split(' ')[0], 10)
      );
    }
  }, [execution_data, duration]);

  return (
    <div className={classes.root}>
      <Typography className={classes.header} variant="h6">
        Workflow Information
      </Typography>
      <hr className={classes.divider} />
      <div className={classes.heightMaintainer}>
        <Typography className={classes.workflowSpacing}>
          Workflow name:
          <br />
          {workflow_name}
        </Typography>
      </div>
      <hr />
      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>State: {data.phase}</Typography>
          <Typography>Start time: {timeDifference(data.startedAt)}</Typography>
          {JSON.parse(execution_data).phase !== 'Running' ? (
            <>
              <Typography>
                End time: {timeDifference(data.finishedAt)}
              </Typography>
              <Typography>Duration: {`${duration} minutes`}</Typography>
            </>
          ) : (
            <></>
          )}
          <Typography>Namespace: {data.namespace}</Typography>
        </div>
      </div>
      <hr />
      <div className={classes.workflowSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>Cluster: {cluster_name}</Typography>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
