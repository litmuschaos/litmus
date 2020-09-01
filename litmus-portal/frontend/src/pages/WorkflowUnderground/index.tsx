import { useSubscription } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ArgoWorkflow from '../../components/Sections/WorkflowUnderground/ArgoWorkflow';
import SideBar from '../../components/Sections/WorkflowUnderground/WorkflowRepresentation';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_EVENTS } from '../../graphql';
import { LocationState } from '../../models/routerModel';
import {
  ExecutionData,
  WorkflowDataVars,
  WorkflowRun,
  WorkflowSubscription,
} from '../../models/workflowData';
import useStyles from './styles';

interface WorkflowUndergroundProps {
  location: LocationState<WorkflowRun>;
}

const WorkflowUnderground: React.FC<WorkflowUndergroundProps> = ({
  location,
}) => {
  const classes = useStyles();
  const [data, setData] = useState<WorkflowRun>(location.state);

  const dataSub = useSubscription<WorkflowSubscription, WorkflowDataVars>(
    WORKFLOW_EVENTS,
    {
      variables: { projectID: '00000' },
    }
  );

  useEffect(() => {
    const workflowCompleted: boolean =
      (JSON.parse(location.state.execution_data) as ExecutionData).phase ===
      'Succeeded';

    if (workflowCompleted && location.state.execution_data !== undefined)
      setData(location.state);
    else setData(dataSub.data?.workflowEventListener ?? location.state);
  }, [location.state, dataSub.data, data.execution_data]);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.workflowGraph}>
          <Typography className={classes.heading}>
            {data.workflow_name}
          </Typography>
          <Typography>
            Click on test to see detailed log of your workflow
          </Typography>

          {/* Argo Workflow DAG Graph */}
          <ArgoWorkflow
            {...(JSON.parse(data.execution_data) as ExecutionData)}
          />
        </div>
        <SideBar
          workflow_name={data.workflow_name}
          execution_data={data.execution_data}
          cluster_name={data.cluster_name}
        />
      </div>
    </Scaffold>
  );
};

export default WorkflowUnderground;
