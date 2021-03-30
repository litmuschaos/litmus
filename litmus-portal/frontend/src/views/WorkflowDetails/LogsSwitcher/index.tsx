import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Typography, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useQuery, useSubscription } from '@apollo/client';
import YAML from 'yaml';
import {
  PodLog,
  PodLogRequest,
  PodLogVars,
} from '../../../models/graphql/podLog';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import useStyles from './styles';
import { WORKFLOW_DETAILS, WORKFLOW_LOGS } from '../../../graphql';
import { RootState } from '../../../redux/reducers';

interface TabPanelProps {
  children: React.ReactNode;
  index: any;
  value: any;
  style: any;
}

interface ChaosDataVar {
  exp_pod: string;
  runner_pod: string;
  chaos_namespace: string;
}

interface LogsSwitcherProps extends PodLogRequest {}

// TODO: These below local Tab components will be removed after merge with master
// TabPanel is used to implement the functioning of tabs
function TabPanel(props: TabPanelProps) {
  const { children, value, index, style, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={style}
      {...other}
    >
      {value === index && (
        <div style={style} {...other}>
          {children}
        </div>
      )}
    </div>
  );
}

// tabProps returns 'id' and 'aria-control' props of Tab
function tabProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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

  const [chaosResult, setChaosResult] = useState('');
  useEffect(() => {
    if (workflow !== undefined) {
      const nodeData = JSON.parse(workflow.execution_data).nodes[pod_name];
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
              backgroundColor: theme.palette.secondary.dark,
            },
          }}
        >
          <Tab label="Logs" {...tabProps(0)} />
          {type === 'ChaosEngine' && (
            <Tab label="Chaos Results" {...tabProps(1)} />
          )}
        </Tabs>
      </div>
      <TabPanel value={selectedTab} index={0} style={{ height: '100%' }}>
        <div className={classes.logs}>
          {data !== undefined ? (
            <div>{parseLogs(data.getPodLog.log)}</div>
          ) : (
            <Typography variant="h5">
              {t('workflowDetailsView.nodeLogs.fetching')}
            </Typography>
          )}
        </div>
      </TabPanel>
      {type === 'ChaosEngine' && (
        <TabPanel value={selectedTab} index={1} style={{ height: '100%' }}>
          <div className={classes.logs}>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Typography className={classes.text}>{chaosResult}</Typography>
            </div>
          </div>
        </TabPanel>
      )}
    </>
  );
};

export default LogsSwitcher;
