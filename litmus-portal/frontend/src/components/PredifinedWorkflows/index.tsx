import React, { useState } from 'react';
import {
  preDefinedWorkflowData,
  SelectWorkflowCallBackType,
} from '../../models/predefinedWorkflow';
import CustomCard from '../CustomCard';
import CustomWorkflowCard from '../CustomCard/CustomWorkflow';
import useStyles from './styles';

interface PredifinedWorkflowsProps {
  workflows: preDefinedWorkflowData[];
  CallbackOnSelectWorkflow: SelectWorkflowCallBackType;
}

const PredifinedWorkflows: React.FC<PredifinedWorkflowsProps> = ({
  workflows,
  CallbackOnSelectWorkflow,
}) => {
  const classes = useStyles();
  const [selectedId, setSelectedID] = useState('');

  return (
    <div className={classes.root}>
      {workflows &&
        workflows.map((w: preDefinedWorkflowData) =>
          w.customWorkflow ? (
            <CustomWorkflowCard />
          ) : (
            <CustomCard
              key={w.workflowID}
              title={w.title}
              urlToIcon={w.urlToIcon}
              provider={w.provider}
              chaosWkfCRDLink={w.chaosWkfCRDLink}
              selectedID={selectedId}
              handleClick={() => {
                const workflowDetails = {
                  name: w.title as string,
                  id: w.workflowID as string,
                  link: w.chaosWkfCRDLink as string,
                  description: w.description as string,
                };
                setSelectedID(w.workflowID as string);
                CallbackOnSelectWorkflow(workflowDetails);
              }}
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
