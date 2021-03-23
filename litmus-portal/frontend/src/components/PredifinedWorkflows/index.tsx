import React from 'react';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import CustomCard from '../WorkflowCard';
import CustomWorkflowCard from '../WorkflowCard/CustomWorkflow';
import useStyles from './styles';

interface PredifinedWorkflowsProps {
  workflows: preDefinedWorkflowData[];
  callbackOnSelectWorkflow: (index: number) => void;
  isCustomWorkflowVisible: boolean;
}

const PredifinedWorkflows: React.FC<PredifinedWorkflowsProps> = ({
  workflows,
  callbackOnSelectWorkflow,
  isCustomWorkflowVisible,
}) => {
  const workflowAction = useActions(WorkflowActions);
  const projectID = getProjectID();
  const userRole = getProjectRole();
  const classes = useStyles();
  return (
    <div className={classes.root} data-cy="PredefinedWorkflowsPanel">
      {workflows &&
        workflows.map((w: preDefinedWorkflowData, index: number) => (
          <div key={w.workflowID} data-cy="templatesCard">
            <CustomCard
              key={w.workflowID}
              title={w.title}
              urlToIcon={w.urlToIcon}
              chaosinfra={w.chaosinfra}
              provider={w.provider}
              chaosWkfCRDLink={w.chaosWkfCRDLink}
              selectedID={w.workflowID}
              handleClick={() => callbackOnSelectWorkflow(index)}
              description={w.description}
              totalRuns={w.totalRuns}
              gitLink={w.gitLink}
              workflowID={w.workflowID}
            />
          </div>
        ))}
      {isCustomWorkflowVisible && (
        <div data-cy="CustomWorkflowCard">
          <CustomWorkflowCard
            handleClick={() => {
              workflowAction.setWorkflowDetails({
                name: `custom-chaos-workflow-${Math.round(
                  new Date().getTime() / 1000
                )}`,
                description: 'Custom Chaos Workflow',
                isCustomWorkflow: true,
                namespace: 'litmus',
                customWorkflows: [],
              });
              history.push({
                pathname: '/create-workflow/custom',
                search: `?projectID=${projectID}&projectRole=${userRole}`,
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PredifinedWorkflows;
