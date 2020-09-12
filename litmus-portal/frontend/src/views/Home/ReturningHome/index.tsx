import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import useStyles from './style';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
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
}
const ReturningHome: React.FC<ReturningHomeProps> = ({
  callbackToSetSecondlogin,
}) => {
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(true);

  const userData = useSelector((state: RootState) => state.userData);

  // Query to get workflows
  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID: userData.selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const classes = useStyles();

  useEffect(() => {
    if (
      !loading &&
      !error &&
      data &&
      data.getWorkFlowRuns.slice(0).length >= 1
    ) {
      setWorkflowDataPresent(true);
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
            average={8}
            max={24}
          />
          <PassedVsFailed passed={75} failed={25} />
          <AverageResilienceScore value={50} />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ReturningHome;
