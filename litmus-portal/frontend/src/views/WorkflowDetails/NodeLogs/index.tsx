import { useQuery, useSubscription } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { WORKFLOW_DETAILS, WORKFLOW_LOGS } from '../../../graphql';
import {
  PodLog,
  PodLogRequest,
  PodLogVars,
} from '../../../models/graphql/podLog';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

interface NodeLogsProps extends PodLogRequest {}

interface ChaosDataVar {
  exp_pod: string;
  runner_pod: string;
  chaos_namespace: string;
}

const NodeLogs: React.FC<NodeLogsProps> = ({
  cluster_id,
  workflow_run_id,
  pod_namespace,
  pod_name,
  pod_type,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const { data: workflow_data } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
  );

  const workflow = workflow_data?.getWorkFlowRuns.filter(
    (w) => w.workflow_run_id === workflow_run_id
  )[0];

  const [chaosData, setChaosData] = useState<ChaosDataVar>({
    exp_pod: '',
    runner_pod: '',
    chaos_namespace: '',
  });

  useEffect(() => {
    if (workflow !== undefined) {
      const nodeData = JSON.parse(workflow.execution_data).nodes[pod_name];
      if (nodeData && nodeData.chaosData)
        setChaosData({
          exp_pod: nodeData.chaosData.experimentPod,
          runner_pod: nodeData.chaosData.runnerPod,
          chaos_namespace: nodeData.chaosData.namespace,
        });
      else
        setChaosData({
          exp_pod: '',
          runner_pod: '',
          chaos_namespace: '',
        });
    }
  }, [workflow_data]);

  const { data } = useSubscription<PodLog, PodLogVars>(WORKFLOW_LOGS, {
    variables: {
      podDetails: {
        cluster_id,
        workflow_run_id,
        pod_name,
        pod_namespace,
        pod_type,
        exp_pod: chaosData.exp_pod,
        runner_pod: chaosData.runner_pod,
        chaos_namespace: chaosData.chaos_namespace,
      },
    },
  });

  const chaosLogs = (chaoslog: any) => {
    let log_str = '';
    if (Object.keys(chaoslog).length) {
      for (let i = 0; i <= Object.keys(chaoslog).length; i++) {
        const obj = Object.keys(chaoslog)[i];
        if (obj !== undefined) log_str += chaoslog[obj];
      }
      return log_str;
    }
    if (
      workflow !== undefined &&
      JSON.parse(workflow?.execution_data).nodes[pod_name].type ===
        'ChaosEngine'
    ) {
      return t('workflowDetailsView.nodeLogs.chaosLogs');
    }
    return '';
  };

  const parseLogs = (logs: string) => {
    try {
      const podLogs = JSON.parse(logs);
      return (
        <div>
          <div>
            {podLogs?.main_logs !== null && podLogs?.main_logs !== '' ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                <Typography className={classes.text}>
                  {podLogs?.main_logs}
                </Typography>
              </div>
            ) : (
              <Typography className={classes.text}>
                {t('workflowDetailsView.nodeLogs.mainLogs')}
              </Typography>
            )}
          </div>
          <div>
            {podLogs?.chaos_logs != null ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                <Typography className={classes.text}>
                  {chaosLogs(podLogs?.chaos_logs)}
                </Typography>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      );
    } catch {
      return (
        <Typography className={classes.text}>
          {t('workflowDetailsView.nodeLogs.couldNot')}
        </Typography>
      );
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.logs}>
        {data !== undefined ? (
          <div>{parseLogs(data.getPodLog.log)}</div>
        ) : (
          <Typography variant="h5">
            {t('workflowDetailsView.nodeLogs.fetching')}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default NodeLogs;
