import React from 'react';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';
import CustomCard from '../WorkflowCard';
import CustomWorkflowCard from '../WorkflowCard/CustomWorkflow';
import useStyles from './styles';

interface PredifinedWorkflowsProps {
  workflows: preDefinedWorkflowData[];
  callbackOnSelectWorkflow: (index: number) => void;
}

const PredifinedWorkflows: React.FC<PredifinedWorkflowsProps> = ({
  workflows,
  callbackOnSelectWorkflow,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {workflows &&
        workflows.map((w: preDefinedWorkflowData, index: number) =>
          w.isCustom ? (
            <CustomWorkflowCard
              handleClick={() => callbackOnSelectWorkflow(index)}
            />
          ) : (
            <CustomCard
              key={w.workflowID}
              title={w.title}
              urlToIcon={w.urlToIcon}
              provider={w.provider}
              chaosWkfCRDLink={w.chaosWkfCRDLink}
              selectedID={w.workflowID}
              handleClick={() => callbackOnSelectWorkflow(index)}
              description={w.description}
              totalRuns={w.totalRuns}
              gitLink={w.gitLink}
              workflowID={w.workflowID}
            />
          )
        )}
    </div>
  );
};

export default PredifinedWorkflows;
