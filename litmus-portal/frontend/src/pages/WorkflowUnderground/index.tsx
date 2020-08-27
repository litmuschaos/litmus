import React, { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { Typography } from '@material-ui/core';
import Scaffold from '../../containers/layouts/Scaffold';
import SideBar from '../../components/Sections/WorkflowUnderground/WorkflowRepresentation';
import useStyles from './styles';
import Loader from '../../components/Loader';
import { WORKFLOW_EVENTS } from '../../graphql';

interface WorkflowUndergroundProps {
  location: any;
}

const WorkflowUnderground: React.FC<WorkflowUndergroundProps> = ({
  location,
}) => {
  const classes = useStyles();

  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [data, setData] = useState<any>({
    workflow_name: '',
    workflow_run_id: '',
    execution_data: '',
    last_updated: '',
    cluster_name: '',
  });

  const dataSub = useSubscription(WORKFLOW_EVENTS);

  useEffect(() => {
    if (
      JSON.parse(location.state.execution_data).phase === 'Succeeded' &&
      location.state.execution_data !== undefined
    ) {
      setIsInitial(false);
      const {
        workflow_name,
        workflow_run_id,
        execution_data,
        last_updated,
        cluster_name,
      } = location.state;
      setData({
        workflow_name,
        workflow_run_id,
        execution_data,
        last_updated,
        cluster_name,
      });
    } else if (dataSub.data !== undefined) {
      setIsInitial(false);

      const {
        workflow_name,
        workflow_run_id,
        execution_data,
        last_updated,
        cluster_name,
      } = dataSub.data.workflowEventListener;
      setData({
        workflow_name,
        workflow_run_id,
        execution_data,
        last_updated,
        cluster_name,
      });
    } else if (dataSub.data === undefined) {
      setIsInitial(true);
    }
  }, [isInitial, location, dataSub.data]);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.workflowGraph}>
          <Typography className={classes.heading}>
            Workflow Underground
          </Typography>
          <Typography>
            Click on test to see detailed log of your workflow
          </Typography>
        </div>
        {isInitial ? (
          <div className={classes.loaderDiv}>
            <Loader />
          </div>
        ) : (
          <SideBar
            workflow_name={data.workflow_name}
            execution_data={data.execution_data}
            cluster_name={data.cluster_name}
          />
        )}
      </div>
    </Scaffold>
  );
};

export default WorkflowUnderground;
