import { useQuery, useSubscription } from '@apollo/client';
import { Tabs, Typography, useTheme } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { StyledTab, TabPanel } from '../../../components/Tabs';
import {
  WORKFLOW_DETAILS_WITH_EXEC_DATA,
  WORKFLOW_LOGS,
} from '../../../graphql';
import {
  PodLog,
  PodLogRequest,
  PodLogVars,
} from '../../../models/graphql/podLog';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface ChaosDataVar {
  exp_pod: string;
  runner_pod: string;
  chaos_namespace: string;
}

interface LogsSwitcherProps extends PodLogRequest {}

const LogsSwitcher: React.FC<LogsSwitcherProps> = ({
  cluster_id,
  workflow_run_id,
  pod_namespace,
  pod_name,
  pod_type,
}) => {
  const theme = useTheme();
  const { type } = useSelector((state: RootState) => state.selectedNode);
  const [selectedTab, setSelectedTab] = useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();

  const { data: workflow_data } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS_WITH_EXEC_DATA,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          workflow_run_ids: [workflow_run_id],
        },
      },
    }
  );

  const workflow = workflow_data?.getWorkflowRuns.workflow_runs[0];

  const [chaosData, setChaosData] = useState<ChaosDataVar>({
    exp_pod: '',
    runner_pod: '',
    chaos_namespace: '',
  });

  useEffect(() => {
    if (workflow !== undefined) {
      const nodeData = (JSON.parse(workflow.execution_data) as ExecutionData)
        .nodes[pod_name];
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
  }, [workflow_data, pod_name]);

  const [chaosResult, setChaosResult] = useState('');

  useEffect(() => {
    if (workflow !== undefined) {
      const nodeData = (JSON.parse(workflow.execution_data) as ExecutionData)
        .nodes[pod_name];
      if (nodeData?.chaosData?.chaosResult) {
        setChaosResult(YAML.stringify(nodeData.chaosData?.chaosResult));
      } else {
        setChaosResult('Chaos Result Not available');
      }
    }
  }, [workflow_data, pod_name]);

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
      (JSON.parse(workflow.execution_data) as ExecutionData).nodes[pod_name]
        .type === 'ChaosEngine'
    ) {
      return t('workflowDetailsView.nodeLogs.chaosLogs');
    }
    return '';
  };

  // Function to download the logs
  const downloadLogs = (logs: any, podName: string) => {
    const element = document.createElement('a');
    let chaos_logs = '';
    try {
      chaos_logs = chaosLogs(logs.chaos_logs);
    } catch {
      chaos_logs = 'Chaos Logs unavailable';
    }
    const file = new Blob([logs?.main_logs, chaos_logs], {
      type: 'text/txt',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${podName}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const parseLogs = (logs: string) => {
    try {
      const podLogs = JSON.parse(logs);
      return (
        <div data-cy="LogsWindow">
          <div>
            {workflow !== undefined &&
            JSON.parse(workflow?.execution_data).nodes[pod_name].type ===
              'ChaosEngine' ? (
              <ButtonFilled
                onClick={() => {
                  downloadLogs(podLogs, pod_name);
                }}
                className={classes.downloadLogsBtn}
              >
                <Typography>
                  <img src="./icons/download-logs.svg" alt="download logs" />{' '}
                  {t('workflowDetailsView.logs')}
                </Typography>
              </ButtonFilled>
            ) : (
              <></>
            )}
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
            {podLogs?.chaos_logs && (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                <Typography className={classes.text}>
                  {chaosLogs(podLogs.chaos_logs)}
                </Typography>
              </div>
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

  useEffect(() => {
    if (type !== 'ChaoEngine') setSelectedTab(0);
  }, [type]);

  return (
    <>
      <div className={classes.tabBar}>
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.highlight,
            },
          }}
        >
          <StyledTab label="Logs" />
          {type === 'ChaosEngine' && <StyledTab label="Chaos Results" />}
        </Tabs>
      </div>
      <TabPanel value={selectedTab} index={0} style={{ height: '100%' }}>
        <div className={classes.logs}>
          {data !== undefined ? (
            <div>{parseLogs(data.getPodLog.log)}</div>
          ) : (
            <Typography className={classes.text} variant="h5">
              {t('workflowDetailsView.nodeLogs.fetching')}
            </Typography>
          )}
        </div>
      </TabPanel>
      {type === 'ChaosEngine' && (
        <TabPanel value={selectedTab} index={1} style={{ height: '100%' }}>
          <div className={classes.logs}>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Typography
                data-cy="ChaosResultTypography"
                className={classes.text}
              >
                {chaosResult}
              </Typography>
            </div>
          </div>
        </TabPanel>
      )}
    </>
  );
};

export default LogsSwitcher;
