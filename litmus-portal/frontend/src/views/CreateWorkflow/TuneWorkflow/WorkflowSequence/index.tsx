import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
} from 'react-beautiful-dnd';
import YAML from 'yaml';
import { Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../../redux/reducers';
import { reorderSteps } from './reorder';
import trimString from '../../../../utils/trim';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import useActions from '../../../../redux/actions';
import useStyles from './styles';

interface ManifestSteps {
  name: string;
  template: string;
}

interface StepType {
  [key: string]: ManifestSteps[];
}

interface ExperimentSequenceProps {
  handleSequenceModal: (sequenceState: boolean) => void;
  getSteps: (steps: StepType) => void;
}

const WorkflowSequence: React.FC<ExperimentSequenceProps> = ({
  handleSequenceModal,
  getSteps,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );
  const workflow = useActions(WorkflowActions);
  const manifestSteps = YAML.parse(manifest).spec.templates[0].steps;

  const [steps, setSteps] = useState<StepType>({});

  /**
   * handleStepsChange updates the steps in the main manifest
   */
  const handleStepsChange = () => {
    const updatedSteps: Array<ManifestSteps[]> = [];
    Object.entries(steps).forEach(([, value]) => {
      if ((value as ManifestSteps[]).length !== 0) {
        updatedSteps.push(value as ManifestSteps[]);
      }
    });

    const updatedManifest = YAML.parse(manifest);
    delete updatedManifest.spec.templates[0].steps;
    updatedManifest.spec.templates[0].steps = updatedSteps;

    workflow.setWorkflowManifest({
      manifest: YAML.stringify(updatedManifest),
    });
    handleSequenceModal(false);
  };

  /**
   * useEffect to save the state in StepType format
   * on the first render
   */
  useEffect(() => {
    const modifiedSteps: StepType = {};
    manifestSteps.forEach((step: any, index: number) => {
      modifiedSteps[`stepname${index}`] = step;
    });
    setSteps(modifiedSteps);
  }, []);

  getSteps(steps);
  return (
    <div>
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          /**
           * If the item is dropped outside the list
           */
          if (!destination) {
            return;
          }
          const newSteps = reorderSteps(steps, source, destination);
          setSteps(newSteps);
        }}
      >
        <div className={classes.dragdropDiv}>
          {Object.entries(steps).map(([key, value]) => {
            return (
              <Droppable
                key={key}
                droppableId={key}
                type="CARD"
                direction="horizontal"
                isCombineEnabled={false}
                isDropDisabled={key === 'stepname0'}
              >
                {(dropProvided) => (
                  <div {...dropProvided.droppableProps}>
                    <div>
                      <div>
                        <div
                          className={classes.droppableDiv}
                          ref={dropProvided.innerRef}
                        >
                          {(value as ManifestSteps[]).map(
                            (step: ManifestSteps, index: number) => {
                              return (
                                <Draggable
                                  key={step.name}
                                  draggableId={step.name}
                                  index={index}
                                  isDragDisabled={key === 'stepname0'}
                                >
                                  {(dragProvided: DraggableProvided) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                    >
                                      <div className={classes.draggableDiv}>
                                        <img
                                          className={classes.expImg}
                                          src="./icons/sequencing-exp.svg"
                                          alt={step.name}
                                        />
                                        <Typography className={classes.expName}>
                                          {trimString(step.name, 15)}
                                        </Typography>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            }
                          )}
                          {dropProvided.placeholder}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
      <Typography className={classes.sequencingHeader}>
        {t('customWorkflow.createWorkflow.selectAnExp')}
      </Typography>
      <Typography className={classes.sequencingDesc}>
        {t('customWorkflow.sequence.dragexp')}
      </Typography>
      <div className={classes.buttonDiv}>
        <ButtonFilled
          variant="error"
          onClick={() => handleSequenceModal(false)}
          className={classes.discard}
        >
          {t('customWorkflow.sequence.discard')}
        </ButtonFilled>
        <ButtonFilled onClick={handleStepsChange}>
          {t('customWorkflow.sequence.saveChanges')}
        </ButtonFilled>
      </div>
    </div>
  );
};

export default WorkflowSequence;
