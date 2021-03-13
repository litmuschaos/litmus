import {
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import { ButtonOutlined, Modal } from 'litmus-ui';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../../components/Button/ButtonOutline';
import { customWorkflow } from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import useStyles from './styles';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import * as TemplateSelectionActions from '../../../../redux/actions/template';
import { Steps, CustomYAML } from '../../../../models/redux/customyaml';
import { history } from '../../../../redux/configureStore';

interface VerifyCommitProps {
  gotoStep: (page: number) => void;
}

const ScheduleCustomWorkflow: React.FC<VerifyCommitProps> = ({ gotoStep }) => {
  const workflowDetails = useSelector((state: RootState) => state.workflowData);
  const [workflows, setWorkflows] = useState<customWorkflow[]>(
    workflowDetails.customWorkflows
  );
  const workflowAction = useActions(WorkflowActions);
  const template = useActions(TemplateSelectionActions);
  const [revertChaos, setRevertChaos] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<customWorkflow>();
  const classes = useStyles();
  const { t } = useTranslation();
  // Function for drag operation
  const onDragOperation = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedItem(workflows[index]);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (index: number) => {
    const draggedOverItem = workflows[index];
    // If the item is dragged over itself, ignore
    if (draggedItem === draggedOverItem) {
      return;
    }
    // Filter out the currently dragged item
    const items = workflows.filter((item) => item !== draggedItem);
    // Add the dragged item after the dragged over item
    items.splice(index, 0, draggedItem as customWorkflow);
    setWorkflows([...items]);
    workflowAction.setWorkflowDetails({
      customWorkflows: [...items],
    });
  };
  // Edit experiment operation
  const editExperiment = (index: number) => {
    workflowAction.setWorkflowDetails({
      ...workflowDetails,
      customWorkflow: {
        ...workflowDetails.customWorkflows[index],
        index,
      },
    });
    gotoStep(1);
  };
  // View YAML operation
  const viewYaml = (index: number) => {
    workflowAction.setWorkflowDetails({
      customWorkflow: {
        ...workflowDetails.customWorkflows[index],
        index,
      },
    });
    gotoStep(3);
  };
  // Delete experiment operation
  const deleteExperiment = (index: number) => {
    workflows.splice(index, 1);
    setWorkflows(workflows);
    workflowAction.setWorkflowDetails({
      customWorkflows: workflows,
    });
  };
  // State to generate a custom YAML
  const yamlTemplate: CustomYAML = {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      name: `${workflowDetails.name}`,
      namespace: `${workflowDetails.namespace}`,
    },
    spec: {
      arguments: {
        parameters: [
          {
            name: 'adminModeNamespace',
            value: `${workflowDetails.namespace}`,
          },
        ],
      },
      entrypoint: 'custom-chaos',
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
      },
      serviceAccountName: 'argo-chaos',
      templates: [
        {
          name: '',
          steps: [[]],
          container: {
            image: '',
            command: [],
            args: [],
          },
        },
      ],
    },
  };

  const [generatedYAML, setGeneratedYAML] = useState<CustomYAML>(yamlTemplate);

  // Function to generate custom YAML
  const customYAMLGenerator = () => {
    // Install all experiment string
    let installAllExp = '';

    // Remove chaosEngine
    let removeChaosEngine = '';

    // Initial step in experiment
    const customSteps: Steps[][] = [
      [
        {
          name: 'install-chaos-experiments',
          template: 'install-chaos-experiments',
        },
      ],
    ];
    workflows.forEach((data) => {
      installAllExp = `${installAllExp}kubectl apply -f /tmp/${
        data.experiment_name?.split('/')[1]
      }.yaml -n {{workflow.parameters.adminModeNamespace}} | `;
      removeChaosEngine = `${removeChaosEngine} ${
        data.experiment_name?.split('/')[1]
      } `;
      customSteps.push([
        {
          name: data.experiment_name?.split('/')[1] as string,
          template: data.experiment_name?.split('/')[1] as string,
        },
      ]);
    });
    if (revertChaos) {
      customSteps.push([
        {
          name: 'revert-chaos',
          template: 'revert-chaos',
        },
      ]);
    }

    // Step 1 in template (creating array of chaos-steps)
    generatedYAML.spec.templates[0] = {
      name: 'custom-chaos',
      steps: customSteps,
    };

    // Step 2 in template (experiment YAMLs of all experiments)
    generatedYAML.spec.templates[1] = {
      name: 'install-chaos-experiments',
      inputs: {
        artifacts: [],
      },
      container: {
        args: [`${installAllExp}sleep 30`],
        command: ['sh', '-c'],
        image: 'alpine/k8s:1.18.2',
      },
    };
    workflows.forEach((data) => {
      const experimentData = generatedYAML.spec.templates[1].inputs?.artifacts;
      if (experimentData !== undefined) {
        experimentData.push({
          name: data.experiment_name?.split('/')[1] as string,
          path: `/tmp/${data.experiment_name?.split('/')[1]}.yaml`,
          raw: {
            data: data.experimentYAML as string,
          },
        });
      }
    });

    // Step 3 in template (engine YAMLs of all experiments)
    workflows.forEach((data) => {
      generatedYAML.spec.templates.push({
        name: data.experiment_name?.split('/')[1] as string,
        inputs: {
          artifacts: [
            {
              name: data.experiment_name?.split('/')[1] as string,
              path: `/tmp/chaosengine-${
                data.experiment_name?.split('/')[1]
              }.yaml`,
              raw: {
                data: data.yaml as string,
              },
            },
          ],
        },
        container: {
          args: [
            `-file=/tmp/chaosengine-${
              data.experiment_name?.split('/')[1]
            }.yaml`,
            `-saveName=/tmp/engine-name`,
          ],
          image: 'litmuschaos/litmus-checker:latest',
        },
      });
    });

    if (revertChaos) {
      generatedYAML.spec.templates[generatedYAML.spec.templates.length] = {
        name: 'revert-chaos',
        container: {
          args: [
            `kubectl delete chaosengine ${removeChaosEngine} -n {{workflow.parameters.adminModeNamespace}}`,
          ],
          command: ['sh', '-c'],
          image: 'alpine/k8s:1.18.2',
        },
      };
    }

    setGeneratedYAML(generatedYAML);
    workflowAction.setWorkflowDetails({
      yaml: YAML.stringify(generatedYAML),
      stepperActiveStep: 2,
    });
    template.selectTemplate({
      isDisable: false,
    });
    history.push('/create-workflow');
  };

  const handleModalClose = () => {
    setConfirmModal(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <Typography variant="h3" className={classes.headerText} gutterBottom>
          {t('customWorkflow.scheduleWorkflow.scheduleHeader')}
        </Typography>
      </div>
      <div className={classes.workflowDiv}>
        <Typography variant="h4" gutterBottom>
          <strong> {t('customWorkflow.scheduleWorkflow.addedExp')}</strong>
        </Typography>
        <Typography className={classes.headerDesc}>
          {t('customWorkflow.scheduleWorkflow.finishText')}
        </Typography>
        <div>
          <div className={classes.inputDiv}>
            {workflows.map((data, index) => {
              return (
                <li
                  data-cy="experimentRow"
                  className={classes.listItem}
                  onDragOver={() => onDragOver(index)}
                >
                  <Paper
                    draggable
                    elevation={3}
                    onDragStart={(e) => onDragOperation(e, index)}
                    className={classes.experimentDiv}
                  >
                    <Typography className={classes.experimentNameText}>
                      {t('customWorkflow.scheduleWorkflow.experiment')}{' '}
                      {index + 1}:
                    </Typography>
                    <Typography className={classes.experimentName}>
                      {data.experiment_name}
                    </Typography>

                    <div className={classes.buttonsDiv}>
                      <ButtonOutline
                        isDisabled={false}
                        handleClick={() => {
                          viewYaml(index);
                        }}
                      >
                        <div className={classes.buttonsInnerDiv}>
                          <img src="/icons/yaml.svg" alt="yaml" />
                          <Typography className={classes.buttonTextDiv}>
                            {t('customWorkflow.scheduleWorkflow.viewYAML')}
                          </Typography>
                        </div>
                      </ButtonOutline>
                      <ButtonOutline
                        isDisabled={false}
                        handleClick={() => {
                          editExperiment(index);
                        }}
                      >
                        <div className={classes.buttonsInnerDiv}>
                          <img src="/icons/Edit.svg" alt="edit" />
                          <Typography className={classes.buttonTextDiv}>
                            {t('customWorkflow.scheduleWorkflow.editBtn')}
                          </Typography>
                        </div>
                      </ButtonOutline>
                      <ButtonOutline
                        isDisabled={false}
                        handleClick={() => {
                          deleteExperiment(index);
                        }}
                      >
                        <div className={classes.buttonsInnerDiv}>
                          <img
                            src="/icons/deleteSchedule.svg"
                            alt="delete"
                            className={classes.deleteBtnImg}
                          />
                          <Typography className={classes.deleteBtnText}>
                            {t('customWorkflow.scheduleWorkflow.deleteBtn')}
                          </Typography>
                        </div>
                      </ButtonOutline>
                    </div>
                  </Paper>
                </li>
              );
            })}
            <Typography
              className={classes.addExp}
              data-cy="addMoreExperimentsButton"
              onClick={() => gotoStep(0)}
            >
              + {t('customWorkflow.scheduleWorkflow.addExp')}
            </Typography>
          </div>
        </div>
      </div>
      <div className={classes.nextButtonDiv} data-cy="finishConstruction">
        <ButtonFilled
          handleClick={() => {
            setConfirmModal(true);
          }}
          isPrimary
          isDisabled={workflows.length === 0}
        >
          <div>
            <img
              alt="next"
              src="/icons/tick.svg"
              className={classes.nextArrow}
            />
            {t('customWorkflow.scheduleWorkflow.finish')}
          </div>
        </ButtonFilled>
      </div>
      {/* Revert Chaos Confirmation Modal */}
      <Modal
        data-cy="revertChaosVerifyModal"
        open={confirmModal}
        onClose={handleModalClose}
        width="60%"
        modalActions={
          <ButtonOutlined onClick={handleModalClose}>&#x2715;</ButtonOutlined>
        }
      >
        <div className={classes.modalDiv}>
          <div style={{ textAlign: 'left' }}>
            <Typography className={classes.modalHeaderText}>
              {t('customWorkflow.scheduleWorkflow.proceed')}
            </Typography>
            <Typography className={classes.modalExpName}>
              {' '}
              {workflowDetails.name}{' '}
            </Typography>
            <Typography className={classes.modalHeaderText}>
              {t('customWorkflow.scheduleWorkflow.selection')}
            </Typography>
            <FormControlLabel
              className={classes.checkBox}
              control={
                <Checkbox
                  checked={revertChaos}
                  onChange={(event) => {
                    return (
                      setRevertChaos(event.target.checked),
                      setGeneratedYAML(yamlTemplate)
                    );
                  }}
                  className={classes.checkBoxDefault}
                  name="checkedB"
                  color="primary"
                />
              }
              label={
                <Typography className={classes.checkBoxText}>
                  {t('customWorkflow.scheduleWorkflow.revert')}
                </Typography>
              }
            />
            <Typography className={classes.unselectText}>
              {t('customWorkflow.scheduleWorkflow.unselect')}
            </Typography>
            <div className={classes.modalBtnDiv}>
              <ButtonOutlined onClick={() => setConfirmModal(false)}>
                {t('customWorkflow.scheduleWorkflow.cancel')}
              </ButtonOutlined>
              <div className={classes.constructBtn} data-cy="constructButton">
                <ButtonFilled
                  isPrimary
                  handleClick={customYAMLGenerator}
                  isDisabled={workflows.length === 0}
                >
                  {t('customWorkflow.scheduleWorkflow.construct')}
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleCustomWorkflow;
