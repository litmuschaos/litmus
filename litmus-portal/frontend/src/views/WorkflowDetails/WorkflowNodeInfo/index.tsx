/* eslint-disable */
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/reducers';
import timeDifference from '../../../utils/datesModifier';
import NodeLogs from '../NodeLogs';
import useStyles from './styles';
import trimstring from '../../../utils/trim';

interface WorkflowNodeInfoProps {
  workflow_name: string;
  cluster_id: string;
  workflow_run_id: string;
  pod_namespace: string;
}

const WorkflowNodeInfo: React.FC<WorkflowNodeInfoProps> = ({
  workflow_name,
  cluster_id,
  workflow_run_id,
  pod_namespace,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Get the nelected node from redux
  const { phase, pod_name, type, startedAt, finishedAt } = useSelector(
    (state: RootState) => state.selectedNode
  );

  return (
    <div className={classes.root}>
      {/* Node Details */}
      <div className={classes.nodeDetails}>
        <div className={classes.textMargin}>
          <Typography className={classes.bold}>
            {t('workflowDetailsView.workflowInfo.header')}:
          </Typography>
        </div>
        <div className={classes.textMargin}>
          <Typography className={classes.text}>
            {trimstring(workflow_name, 30)}
          </Typography>
          <div className={classes.status}>
            <span className={classes.icon}>
              <img
                className={
                  phase.toLowerCase() === 'running'
                    ? classes.runningSmallIcon
                    : ''
                }
                src={`/icons/${phase.toLowerCase()}.svg`}
              />
            </span>
            <Typography className={classes.text}>{phase}</Typography>
          </div>
        </div>
        <hr />
        <div className={classes.heightMaintainer}>
          <div>
            <div className={classes.textMargin}>
              <Typography className={classes.bold}>
                {t('workflowDetailsView.workflowNodeInfo.startTime')}:
              </Typography>
              &nbsp;&nbsp;&nbsp;
              <Typography className={classes.text}>
                {timeDifference(startedAt)}
              </Typography>
            </div>
            <div className={classes.textMargin}>
              <Typography className={classes.bold}>
                {t('workflowDetailsView.workflowNodeInfo.duration')}:{' '}
              </Typography>
              &nbsp;&nbsp;&nbsp;
              <Typography className={classes.text}>
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
          <div className={classes.textMargin}>
            <Typography className={classes.bold}>
              {t('workflowDetailsView.workflowNodeInfo.endTime')}:
            </Typography>
            &nbsp;&nbsp;&nbsp;
            <Typography className={classes.text}>
              {finishedAt !== ''
                ? timeDifference(finishedAt)
                : 'Not yet finished'}
            </Typography>
          </div>
        </div>
        <div className={classes.marginTop}>
          <img className={classes.icon} src={'/icons/filledDownArrow.svg'} />
          <Typography className={classes.bold}>
            {t('workflowDetailsView.workflowNodeInfo.viewPairs')}
          </Typography>
        </div>
        <div className={classes.marginTop}>
          <img className={classes.icon} src={'/icons/filledDownArrow.svg'} />
          <Typography className={classes.bold}>
            {t('workflowDetailsView.workflowNodeInfo.viewApplicationDetails')}
          </Typography>
        </div>
      </div>
      {/* Node Logs*/}
      <NodeLogs
        cluster_id={cluster_id}
        workflow_run_id={workflow_run_id}
        pod_namespace={pod_namespace}
        pod_name={pod_name}
        pod_type={type}
      />
    </div>
  );
};

export default WorkflowNodeInfo;
