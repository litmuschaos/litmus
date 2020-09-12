import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import * as _ from 'lodash';
import useStyles from './style';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
  ExecutionData,
} from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import PassedVsFailed from '../PassedVsFailed';
import TotalWorkflows from '../TotalWorkflows';
import AverageResilienceScore from '../AverageResilienceScore';

interface secondLoginCallBackType {
  (secondLogin: boolean): void;
}

interface ReturningHomeProps {
  callbackToSetSecondlogin: secondLoginCallBackType;
  currentStatus: boolean;
}
const ReturningHome: React.FC<ReturningHomeProps> = ({
  callbackToSetSecondlogin,
  currentStatus,
}) => {
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(
    currentStatus
  );

  const userData = useSelector((state: RootState) => state.userData);

  // Query to get workflows
  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID: userData.selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const [avgWorkflows, setAvgWorkflows] = useState<number>(0);

  const [maxWorkflows, setMaxWorkflows] = useState<number>(0);

  const [passPercentage, setPassPercentage] = useState<number>(0);

  const getAvgWorkflows = (workflowRundata: WorkflowRun[]) => {
    const workflowRunExecutionData: ExecutionData[] = [];
    workflowRundata.forEach((data) => {
      try {
        const executionData = JSON.parse(data.execution_data);
        workflowRunExecutionData.push(executionData);
      } catch (error) {
        console.error(error);
      }
    });

    const chaosDataArray: any[] = [];
    const experimentTestNameArray: string[] = [];
    const experimentTestVerdictArray: string[] = [];
    const experimentTestResultsArray: number[] = [];

    workflowRunExecutionData.forEach((data) => {
      try {
        const nodeKeys = Object.keys(data.nodes);
        const { nodes } = data;
        const chaosNodeKeys: string[] = [];
        nodeKeys.forEach((node) => {
          try {
            const { name } = data.nodes[node];
            if (name === 'run-chaos') {
              chaosNodeKeys.push(node);
            }
          } catch (error) {
            console.error(error);
          }
        });

        chaosNodeKeys.forEach((key) => {
          try {
            const chaosNode = nodes[key];
            const chaosNodeData = JSON.parse(JSON.stringify(chaosNode));
            chaosDataArray.push(chaosNodeData['chaosData']);
          } catch (error) {
            console.error(error);
          }
        });
      } catch (error) {
        console.error(error);
      }
    });

    chaosDataArray.forEach((data) => {
      try {
        experimentTestNameArray.push(data['experimentName']);
        experimentTestVerdictArray.push(data['experimentVerdict']);
        if (data['experimentVerdict'] === 'Pass') {
          experimentTestResultsArray.push(1);
        } else if (data['experimentVerdict'] === 'Fail') {
          experimentTestResultsArray.push(0);
        }
      } catch (error) {
        console.error(error);
      }
    });

    const groupedResults = _.groupBy(workflowRunExecutionData, (data) =>
      moment.unix(parseInt(data['creationTimestamp'], 10)).startOf('isoWeek')
    );
    const weeks = Object.keys(groupedResults);

    const workflowRunsPerWeek: number[] = [];

    weeks.forEach((week) => {
      workflowRunsPerWeek.push(groupedResults[week].length);
    });

    setAvgWorkflows(
      workflowRunsPerWeek.reduce((a, b) => a + b, 0) /
        workflowRunsPerWeek.length
    );
    setMaxWorkflows(Math.max(...workflowRunsPerWeek));

    setPassPercentage(
      (experimentTestResultsArray.reduce((a, b) => a + b, 0) /
        experimentTestResultsArray.length) *
        100
    );
  };

  const classes = useStyles();

  useEffect(() => {
    if (
      !loading &&
      !error &&
      data &&
      data.getWorkFlowRuns.slice(0).length >= 1
    ) {
      setWorkflowDataPresent(true);
      getAvgWorkflows(data.getWorkFlowRuns);
    } else if (loading === false) {
      setWorkflowDataPresent(false);
    }
  }, [data]);

  useEffect(() => {
    callbackToSetSecondlogin(workflowDataPresent);
  }, [workflowDataPresent]);

  return (
    <div>
      {workflowDataPresent ? (
        <div className={classes.cardsDiv}>
          <TotalWorkflows
            workflow={data?.getWorkFlowRuns.slice(0).length ?? 0}
            average={avgWorkflows}
            max={maxWorkflows}
          />
          <PassedVsFailed
            passed={passPercentage}
            failed={100 - passPercentage}
          />
          <AverageResilienceScore value={passPercentage} />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ReturningHome;
