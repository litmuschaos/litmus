/* eslint-disable */
import { Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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
  const { t } = useTranslation();

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

      {/* Node Type */}
      <div className={classes.heightMaintainer}>
        <Typography className={classes.nodeSpacing}>
          <span className={classes.bold}>
            {t('workflowDetailsView.workflowNodeInfo.type')}:
          </span>{' '}
          {type}
        </Typography>
      </div>
      <hr />

      {/* Node Phase */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.phase')}:
            </span>{' '}
            {phase}
          </Typography>
        </div>
      </div>
      <hr />

      {/* Node Durations */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.startTime')}:
            </span>{' '}
            {timeDifference(startedAt)}
          </Typography>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.endTime')}:
            </span>{' '}
            {finishedAt !== ''
              ? timeDifference(finishedAt)
              : 'Not yet finished'}
          </Typography>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.duration')}:{' '}
            </span>{' '}
            {finishedAt !== ''
              ? (
                  (parseInt(finishedAt, 10) - parseInt(startedAt, 10)) /
                  60
                ).toFixed(1)
              : (
                  (new Date().getTime() / 1000 - parseInt(startedAt, 10)) /
                  60
                ).toFixed(1)}{' '}
            minutes
          </Typography>
        </div>
      </div>
      <hr />
      {/* Step Name */}
      <div className={classes.nodeSpacing}>
        <div className={classes.heightMaintainer}>
          <Typography>
            <span className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.nodeName')}:
            </span>{' '}
            {name}
          </Typography>
        </div>
      </div>
      <div className={classes.footerButton}>
        <ButtonOutlined onClick={() => setLogsOpen(true)}>
          {t('workflowDetailsView.workflowNodeInfo.button.logs')}
        </ButtonOutlined>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
