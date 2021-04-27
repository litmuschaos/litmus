import { useMutation } from '@apollo/client';
import { Divider, IconButton, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import cronstrue from 'cronstrue';
import { ButtonFilled, ButtonOutlined, EditableText, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import AdjustedWeights from '../../../components/AdjustedWeights';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { parseYamlValidations } from '../../../components/YamlEditor/Validations';
import { CREATE_WORKFLOW } from '../../../graphql';
import {
  CreateWorkFlowInput,
  CreateWorkflowResponse,
  WeightMap,
} from '../../../models/graphql/createWorkflowData';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import { experimentMap, WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { history } from '../../../redux/configureStore';
import { RootState } from '../../../redux/reducers';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import { fetchWorkflowNameFromManifest } from '../../../utils/yamlUtils';
import useStyles from './styles';

interface WorkflowProps {
  name: string;
  description: string;
  crd: string;
}

interface VerifyCommitProps {
  handleGoToStep: (page: number) => void;
  isLoading: (loading: boolean) => void;
}

const VerifyCommit = forwardRef(
  ({ handleGoToStep, isLoading }: VerifyCommitProps, ref) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [workflow, setWorkflow] = useState<WorkflowProps>({
      name: '',
      description: '',
      crd: '',
    });
    const [weights, setWeights] = useState<experimentMap[]>([
      {
        experimentName: '',
        weight: 0,
      },
    ]);

    const [open, setOpen] = useState(false);

    // Modal States
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    const tabs = useActions(TabActions);
    const workflowAction = useActions(WorkflowActions);

    const workflowData: WorkflowData = useSelector(
      (state: RootState) => state.workflowData
    );

    const { clusterid, cronSyntax, clustername } = workflowData;

    const manifest = useSelector(
      (state: RootState) => state.workflowManifest.manifest
    );

    const saveWorkflowGenerateName = (manifest: string) => {
      const parsedManifest = YAML.parse(manifest);
      delete parsedManifest.metadata.generateName;
      parsedManifest.metadata.name = `${workflow.name}-${Math.round(
        new Date().getTime() / 1000
      )}`;
      if (parsedManifest.metadata.name.split('-').length > 1) {
        workflowAction.setWorkflowManifest({
          manifest: YAML.stringify(parsedManifest),
        });
      }
    };

    useEffect(() => {
      saveWorkflowGenerateName(manifest);
    }, [workflow.name]);

    useEffect(() => {
      localforage.getItem('workflow').then(
        (workflow) =>
          workflow !== null &&
          setWorkflow({
            name: (workflow as WorkflowDetailsProps).name,
            description: (workflow as WorkflowDetailsProps).description,
            crd: (workflow as WorkflowDetailsProps).CRDLink,
          })
      );
      localforage
        .getItem('weights')
        .then(
          (weight) => weight !== null && setWeights(weight as experimentMap[])
        );
    }, []);

    const [yamlStatus, setYamlStatus] = React.useState(
      `${t('createWorkflow.verifyCommit.codeIsFine')}`
    );

    const [modified, setModified] = React.useState(false);

    const handleOpen = () => {
      setModified(false);
      setOpen(true);
    };

    const handleClose = () => {
      setModified(true);
      setOpen(false);
    };

    const handleNameChange = ({ changedName }: { changedName: string }) => {
      const parsedYaml = YAML.parse(manifest);
      parsedYaml.metadata.name = changedName;
      const nameMappedYaml = YAML.stringify(parsedYaml);
      localforage.getItem('selectedScheduleOption').then((option) => {
        if (
          option !== null &&
          (option as ChooseWorkflowRadio).selected === 'A'
        ) {
          localforage.getItem('workflow').then((w) => {
            const data: WorkflowDetailsProps = {
              name: changedName,
              description: (w as WorkflowDetailsProps).description,
              icon: (w as WorkflowDetailsProps).icon,
              CRDLink: nameMappedYaml,
            };
            localforage.setItem('workflow', data);
          });
        } else {
          localforage.getItem('workflow').then((w) => {
            const data: WorkflowDetailsProps = {
              name: changedName,
              description: (w as WorkflowDetailsProps).description,
              icon: (w as WorkflowDetailsProps).icon,
              CRDLink: '',
            };
            localforage.setItem('workflow', data);
          });
          workflowAction.setWorkflowManifest({
            manifest: nameMappedYaml,
          });
        }
      });
    };

    const handleDescChange = ({ changedDesc }: { changedDesc: string }) => {
      localforage.getItem('workflow').then((w) => {
        const data: WorkflowDetailsProps = {
          name: (w as WorkflowDetailsProps).name,
          description: changedDesc,
          icon: (w as WorkflowDetailsProps).icon,
          CRDLink: (w as WorkflowDetailsProps).CRDLink,
        };
        localforage.setItem('workflow', data);
      });
    };

    const WorkflowTestData: experimentMap[] = weights as any;

    useEffect(() => {
      const editorValidations = parseYamlValidations(manifest, classes);
      const stateObject = {
        markers: editorValidations.markers,
        annotations: editorValidations.annotations,
      };
      if (stateObject.annotations.length > 0) {
        setYamlStatus(`${t('createWorkflow.verifyCommit.errYaml')}`);
      } else {
        setYamlStatus(`${t('createWorkflow.verifyCommit.codeIsFine')}`);
      }
    }, [modified]);

    // Create Workflow Mutation
    const [
      createChaosWorkFlow,
      { loading, error: workflowError },
    ] = useMutation<CreateWorkflowResponse, CreateWorkFlowInput>(
      CREATE_WORKFLOW,
      {
        onError: () => {
          setErrorModal(true);
        },
        onCompleted: () => {
          setFinishModalOpen(true);
        },
      }
    );

    isLoading(loading);

    const handleMutation = () => {
      if (
        workflow.name.length !== 0 &&
        workflow.description.length !== 0 &&
        weights.length !== 0
      ) {
        const weightData: WeightMap[] = [];

        weights.forEach((data) => {
          weightData.push({
            experiment_name: data.experimentName,
            weightage: data.weight,
          });
        });

        /* JSON.stringify takes 3 parameters [object to be converted,
        a function to alter the conversion, spaces to be shown in final result for indentation ] */
        const yml = YAML.parse(manifest);
        const yamlJson = JSON.stringify(yml, null, 2); // Converted to Stringified JSON

        const chaosWorkFlowInputs = {
          workflow_manifest: yamlJson,
          cronSyntax,
          workflow_name: fetchWorkflowNameFromManifest(manifest),
          workflow_description: workflow.description,
          isCustomWorkflow: false,
          weightages: weightData,
          project_id: getProjectID(),
          cluster_id: clusterid,
        };
        createChaosWorkFlow({
          variables: { ChaosWorkFlowInput: chaosWorkFlowInputs },
        });
      }
    };

    const handleErrorModalClose = () => {
      setErrorModal(false);
    };

    const handleFinishModal = () => {
      workflowAction.setWorkflowManifest({ manifest: '', engineYAML: '' });
      localforage.removeItem('workflow');
      localforage.removeItem('selectedScheduleOption');
      localforage.removeItem('hasSetWorkflowData');
      localforage.removeItem('weights');
      localforage.removeItem('selectedHub');
      localforage.removeItem('editSchedule');
      setFinishModalOpen(false);

      tabs.changeWorkflowsTabs(0);
      history.push({
        pathname: '/workflows',
        search: `?projectID=${getProjectID()}&projectRole=${getProjectRole()}`,
      });
    };

    function onNext() {
      handleMutation();
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    // const preventDefault = (event: React.SyntheticEvent) =>
    //  event.preventDefault();
    return (
      <>
        <div className={classes.root}>
          <div className={classes.innerContainer}>
            <div className={classes.suHeader}>
              <div>
                <Typography className={classes.headerText}>
                  {t('createWorkflow.verifyCommit.header')}
                </Typography>
                <Typography className={classes.description}>
                  {t('createWorkflow.verifyCommit.info')}
                </Typography>
              </div>
              <img
                src="/icons/b-finance.svg"
                alt="bfinance"
                className={classes.bfinIcon}
              />
            </div>
            <Divider />

            <Typography className={classes.sumText}>
              {t('createWorkflow.verifyCommit.summary.header')}
            </Typography>

            <div className={classes.outerSum}>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.summary.workflowName')}:
                  </Typography>
                </div>
                <div className={classes.col2} data-cy="WorkflowName">
                  <EditableText
                    value={fetchWorkflowNameFromManifest(manifest)}
                    id="name"
                    fullWidth
                    onChange={(e) =>
                      handleNameChange({ changedName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.summary.clustername')}:
                  </Typography>
                </div>
                <Typography className={classes.clusterName}>
                  {clustername}
                </Typography>
              </div>

              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.summary.desc')}:
                  </Typography>
                </div>
                <div className={classes.col2}>
                  <EditableText
                    value={workflow.description}
                    id="desc"
                    fullWidth
                    multiline
                    onChange={(e) =>
                      handleDescChange({ changedDesc: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.summary.schedule')}:
                  </Typography>
                </div>
                <div className={classes.schCol2}>
                  {cronSyntax === '' ? (
                    <Typography className={classes.schedule}>
                      {t('createWorkflow.verifyCommit.summary.schedulingNow')}
                    </Typography>
                  ) : (
                    <Typography className={classes.schedule}>
                      {cronstrue.toString(cronSyntax)}
                    </Typography>
                  )}

                  <div className={classes.editButton}>
                    <IconButton onClick={() => handleGoToStep(5)}>
                      <EditIcon className={classes.editIcon} data-cy="edit" />
                    </IconButton>
                  </div>
                </div>
              </div>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.summary.adjustedWeights')}:
                  </Typography>
                </div>
                {weights.length === 0 ? (
                  <div>
                    <Typography className={classes.errorText}>
                      {t('createWorkflow.verifyCommit.error')}
                    </Typography>
                  </div>
                ) : (
                  <div className={classes.adjWeights}>
                    <div className={classes.progress}>
                      {WorkflowTestData.map((Test) => (
                        <AdjustedWeights
                          key={Test.weight}
                          testName={`${Test.experimentName} ${t(
                            'createWorkflow.verifyCommit.test'
                          )}`}
                          testValue={Test.weight}
                          spacing={false}
                          icon={false}
                        />
                      ))}
                    </div>
                    <ButtonOutlined
                      onClick={() => handleGoToStep(4)}
                      data-cy="testRunButton"
                    >
                      {t('createWorkflow.verifyCommit.button.edit')}
                    </ButtonOutlined>
                  </div>
                )}
              </div>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    {t('createWorkflow.verifyCommit.YAML')}
                  </Typography>
                </div>
                <div className={classes.yamlFlex}>
                  {weights.length === 0 ? (
                    <Typography className={classes.spacingHorizontal}>
                      {t('createWorkflow.verifyCommit.errYaml')}
                    </Typography>
                  ) : (
                    <Typography>
                      <b>{yamlStatus}</b>
                      <span className={classes.spacingHorizontal}>
                        {t('createWorkflow.verifyCommit.youCanMoveOn')}
                      </span>
                    </Typography>
                  )}
                  <br />
                  <ButtonFilled
                    className={classes.verifyYAMLButton}
                    onClick={handleOpen}
                  >
                    {t('createWorkflow.verifyCommit.button.viewYaml')}
                  </ButtonFilled>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          width="60%"
          modalActions={
            <ButtonOutlined onClick={handleClose} className={classes.closeBtn}>
              &#x2715;
            </ButtonOutlined>
          }
        >
          <YamlEditor content={manifest} filename={workflow.name} readOnly />
        </Modal>

        {/* Finish Modal */}
        <div>
          <Modal
            data-cy="FinishModal"
            open={finishModalOpen}
            onClose={handleFinishModal}
            width="60%"
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            modalActions={
              <div data-cy="GoToWorkflowButton">
                <ButtonOutlined onClick={handleFinishModal}>
                  &#x2715;
                </ButtonOutlined>
              </div>
            }
          >
            <div className={classes.modal}>
              <img src="/icons/finish.svg" alt="mark" />
              <div className={classes.heading}>
                {t('workflowStepper.aNewChaosWorkflow')}
                <br />
                <span className={classes.successful}>{workflow.name}</span>,
                <br />
                <span className={classes.bold}>
                  {t('workflowStepper.successful')}
                </span>
              </div>
              <div className={classes.headWorkflow}>
                {t('workflowStepper.congratulationsSub1')} <br />{' '}
                {t('workflowStepper.congratulationsSub2')}
              </div>
              <div className={classes.button}>
                <ButtonFilled
                  data-cy="selectFinish"
                  onClick={() => {
                    handleFinishModal();
                  }}
                >
                  <div>{t('workflowStepper.workflowBtn')}</div>
                </ButtonFilled>
              </div>
            </div>
          </Modal>
          <Modal
            open={errorModal}
            onClose={handleErrorModalClose}
            width="60%"
            modalActions={
              <ButtonOutlined onClick={handleErrorModalClose}>
                &#x2715;
              </ButtonOutlined>
            }
          >
            <div className={classes.modal}>
              <img src="/icons/red-cross.svg" alt="mark" />
              <div className={classes.heading}>
                <strong>{t('workflowStepper.workflowFailed')}</strong>
              </div>
              <div className={classes.headWorkflow}>
                <Typography>
                  {t('workflowStepper.error')} : {workflowError?.message}
                </Typography>
              </div>
              <div className={classes.button}>
                <ButtonFilled
                  data-cy="selectFinish"
                  onClick={() => {
                    setErrorModal(false);
                  }}
                >
                  <div>{t('workflowStepper.back')}</div>
                </ButtonFilled>
              </div>
            </div>
          </Modal>
        </div>
      </>
    );
  }
);

export default VerifyCommit;
