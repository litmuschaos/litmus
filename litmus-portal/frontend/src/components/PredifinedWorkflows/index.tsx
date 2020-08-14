import React from 'react';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';
import CustomCard from '../CustomCard';
import CustomWorkflowCard from '../CustomCard/CustomWorkflow';
import useStyles from './styles';

interface PredifinedWorkflowsProps {
  workflows: preDefinedWorkflowData[];
  CallbackOnSelectWorkflow: (index: number) => void;
}

const PredifinedWorkflows: React.FC<PredifinedWorkflowsProps> = ({
  workflows,
  CallbackOnSelectWorkflow,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {workflows &&
        workflows.map((w: preDefinedWorkflowData, index: number) =>
          w.customWorkflow ? (
            <CustomWorkflowCard />
          ) : (
            <CustomCard
              key={w.workflowID}
              title={w.title}
              urlToIcon={w.urlToIcon}
              provider={w.provider}
              chaosWkfCRDLink={w.chaosWkfCRDLink}
              selectedID={w.selectedID}
              handleClick={() => CallbackOnSelectWorkflow(index)}
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
