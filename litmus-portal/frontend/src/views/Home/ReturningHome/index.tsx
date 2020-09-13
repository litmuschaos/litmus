/* eslint-disable no-unused-expressions */
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

interface Analyticsdata {
  avgWorkflows: number;
  maxWorkflows: number;
  passPercentage: number;
}

interface ReturningHomeProps {
  callbackToSetSecondlogin: secondLoginCallBackType;
  currentStatus: boolean;
}
const ReturningHome: React.FC<ReturningHomeProps> = ({
  callbackToSetSecondlogin,
  currentStatus,
}) => {
  const classes = useStyles();
  const userData = useSelector((state: RootState) => state.userData);
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(
    currentStatus
  );

  // Query to get workflows
  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID: userData.selectedProjectID },
    }
  );

  const [analyticsData, setAnalyticsData] = useState<Analyticsdata>({
    avgWorkflows: 0,
    maxWorkflows: 0,
    passPercentage: 0,
  });

  const loadAnalyticsData = (workflowRunData: WorkflowRun[]) => {
    const workflowRunExecutionData: ExecutionData[] = [];
    const experimentTestResultsArray: number[] = [];
    const workflowRunsPerWeek: number[] = [];

    workflowRunData?.forEach((data) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        workflowRunExecutionData.push(executionData);
        const { nodes } = executionData;
        for (const key of Object.keys(nodes)) {
          const node = nodes[key];
          if (node.chaosData) {
            const { chaosData } = node;
            experimentTestResultsArray.push(
              chaosData.experimentVerdict === 'Pass' ? 1 : 0
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    });

    const groupedResults = _.groupBy(workflowRunExecutionData, (data) =>
      moment.unix(parseInt(data['creationTimestamp'], 10)).startOf('isoWeek')
    );

    Object.keys(groupedResults).forEach((week) => {
      workflowRunsPerWeek.push(groupedResults[week].length);
    });

    setAnalyticsData({
      avgWorkflows:
        workflowRunsPerWeek.reduce((a, b) => a + b, 0) /
        workflowRunsPerWeek.length,
      maxWorkflows: Math.max(...workflowRunsPerWeek),
      passPercentage:
        (experimentTestResultsArray.reduce((a, b) => a + b, 0) /
          experimentTestResultsArray.length) *
        100,
    });
  };

  useEffect(() => {
    if (
      !loading &&
      !error &&
      data &&
      data.getWorkFlowRuns.slice(0).length >= 1
    ) {
      setWorkflowDataPresent(true);
      loadAnalyticsData(data.getWorkFlowRuns);
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
            average={analyticsData.avgWorkflows}
            max={analyticsData.maxWorkflows}
          />
          <PassedVsFailed
            passed={analyticsData.passPercentage}
            failed={100 - analyticsData.passPercentage}
          />
          <AverageResilienceScore value={analyticsData.passPercentage} />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ReturningHome;
