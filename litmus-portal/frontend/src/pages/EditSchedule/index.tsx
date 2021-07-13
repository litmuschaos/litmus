import { useMutation, useQuery } from '@apollo/client';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import cronstrue from 'cronstrue';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import YAML from 'yaml';
import AdjustedWeights from '../../components/AdjustedWeights';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import { parseYamlValidations } from '../../components/YamlEditor/Validations';
import Scaffold from '../../containers/layouts/Scaffold';
import { UPDATE_SCHEDULE } from '../../graphql/mutations';
import { WORKFLOW_LIST_DETAILS } from '../../graphql/queries';
import {
  CreateWorkFlowInput,
  UpdateWorkflowResponse,
  WeightMap,
} from '../../models/graphql/createWorkflowData';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import { experimentMap, WorkflowData } from '../../models/redux/workflow';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as TemplateSelectionActions from '../../redux/actions/template';
import * as WorkflowActions from '../../redux/actions/workflow';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import { fetchWorkflowNameFromManifest } from '../../utils/yamlUtils';
import { useStyles } from './styles';

const YamlEditor = lazy(() => import('../../components/YamlEditor/Editor'));

interface URLParams {
  workflowName: string;
  scheduleProjectID: string;
}

interface Weights {
  experimentName: string;
  weight: number;
}

interface WorkflowProps {
  name: string;
  description: string;
}

const EditSchedule: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [workflow, setWorkflow] = useState<WorkflowProps>({
    name: '',
    description: '',
  });
  const [weights, setWeights] = useState<experimentMap[]>([
    {
      experimentName: '',
      weight: 0,
    },
  ]);

  const [yamlOpen, setYAMLOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const template = useActions(TemplateSelectionActions);
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const workflowAction = useActions(WorkflowActions);
  // Get Parameters from URL
  const paramData: URLParams = useParams();
  const projectID = getProjectID();
  const userRole = getProjectRole();

  const { data, loading } = useQuery<ScheduledWorkflows, ListWorkflowsInput>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: {
        workflowInput: {
          project_id: projectID,
          filter: {
            workflow_name: paramData.workflowName,
          },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );

  const wfDetails = data && data.ListWorkflow.workflows[0];
  const doc = new YAML.Document();
  const w: Weights[] = [];
  const { cronSyntax, clusterid, clustername } = workflowData;

  const [createChaosWorkFlow, { error: workflowError }] = useMutation<
    UpdateWorkflowResponse,
    CreateWorkFlowInput
  >(UPDATE_SCHEDULE, {
    onCompleted: () => {
      setFinishModalOpen(true);
    },
  });

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
        workflow_id: wfDetails?.workflow_id,
        workflow_manifest: yamlJson,
        cronSyntax,
        workflow_name: fetchWorkflowNameFromManifest(manifest),
        workflow_description: workflow.description,
        isCustomWorkflow: false,
        weightages: weightData,
        project_id: projectID,
        cluster_id: clusterid,
      };

      createChaosWorkFlow({
        variables: { ChaosWorkFlowInput: chaosWorkFlowInputs },
      });
    }
  };

  useEffect(() => {
    localforage.getItem('editSchedule').then((isCronEdited) => {
      if (wfDetails !== undefined) {
        for (let i = 0; i < wfDetails?.weightages.length; i++) {
          w.push({
            experimentName: wfDetails?.weightages[i].experiment_name,
            weight: wfDetails?.weightages[i].weightage,
          });
        }
        doc.contents = JSON.parse(wfDetails?.workflow_manifest);
        workflowAction.setWorkflowManifest({
          manifest: isCronEdited === null ? doc.toString() : manifest,
        });
        setWorkflow({
          name: wfDetails?.workflow_name,
          description: wfDetails?.workflow_description,
        });
        localforage.setItem('weights', w);
        workflowAction.setWorkflowDetails({
          workflow_id: wfDetails?.workflow_id,
          clusterid: wfDetails?.cluster_id,
          cronSyntax:
            isCronEdited === null ? wfDetails?.cronSyntax : cronSyntax,
          scheduleType: {
            scheduleOnce:
              wfDetails?.cronSyntax === '' ? 'now' : 'recurringSchedule',
            recurringSchedule: '',
          },
          scheduleInput: {
            hour_interval: 0,
            day: 1,
            weekday: 'Monday',
            time: new Date(),
            date: new Date(),
          },
        });
      }
    });

    template.selectTemplate({ selectTemplateID: 0, isDisable: false });
    setWeights(w);
  }, [data]);

  const tabs = useActions(TabActions);

  const [yamlStatus, setYamlStatus] = React.useState(
    `${t('createWorkflow.verifyCommit.codeIsFine')}`
  );
  const [modified, setModified] = React.useState(false);

  const handleEditOpen = () => {
    setModified(false);
    setYAMLOpen(true);
  };

  const handleEditClose = () => {
    setModified(true);
    setOpen(false);
  };

  const handleNext = () => {
    handleMutation();
  };

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

  const handleFinishModal = () => {
    history.push({
      pathname: `/workflows`,
      search: `?projectID=${projectID}&projectRole=${userRole}`,
    });
    setFinishModalOpen(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal(false);
  };

  return (
    <Scaffold>
      {loading || !manifest ? (
        <Loader />
      ) : (
        <>
          <BackButton />
          <Typography className={classes.title}>
            {t('editSchedule.title')}
          </Typography>
          <div className={classes.root}>
            <div className={classes.innerContainer}>
              {yamlOpen ? (
                <div className={classes.editorWrapper}>
                  <div className={`${classes.flex} ${classes.additional}`}>
                    <div className={classes.flex}>
                      <img
                        style={{ width: '2rem' }}
                        src="./icons/terminal.svg"
                        alt="Terminal Icon"
                      />
                      <Typography className={classes.name}>
                        {fetchWorkflowNameFromManifest(manifest)}.yaml
                      </Typography>
                    </div>

                    <ButtonOutlined
                      onClick={() => setYAMLOpen(false)}
                      className={classes.editorCloseBtn}
                    >
                      x
                    </ButtonOutlined>
                  </div>
                  <YamlEditor
                    content={manifest}
                    filename={workflow.name}
                    readOnly
                  />
                </div>
              ) : (
                <>
                  <Typography className={classes.sumText}>
                    {t('createWorkflow.verifyCommit.summary.header')}
                  </Typography>

                  <div className={classes.outerSum}>
                    <div className={classes.summaryDiv}>
                      <div className={classes.innerSumDiv}>
                        <Typography className={classes.col1}>
                          {t(
                            'createWorkflow.verifyCommit.summary.workflowName'
                          )}
                          :
                        </Typography>
                      </div>
                      <div className={classes.col2} data-cy="WorkflowName">
                        <Typography>
                          {fetchWorkflowNameFromManifest(manifest)}
                        </Typography>
                      </div>
                    </div>

                    <div className={classes.summaryDiv}>
                      <div className={classes.innerSumDiv}>
                        <Typography className={classes.col1}>
                          {t('createWorkflow.verifyCommit.summary.clustername')}
                          :
                        </Typography>
                      </div>
                      <Typography className={classes.schCol2}>
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
                        <Typography>{workflow.description}</Typography>
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
                          <Typography>
                            {t(
                              'createWorkflow.verifyCommit.summary.schedulingNow'
                            )}
                          </Typography>
                        ) : (
                          <Typography>
                            {cronstrue.toString(cronSyntax)}
                          </Typography>
                        )}

                        <ButtonOutlined
                          className={classes.editButton}
                          onClick={() =>
                            history.push({
                              pathname: `/workflows/schedule/${projectID}/${fetchWorkflowNameFromManifest(
                                manifest
                              )}/set`,
                              search: `?projectID=${projectID}&projectRole=${userRole}`,
                            })
                          }
                        >
                          <EditIcon
                            className={classes.editIcon}
                            data-cy="edit"
                          />
                          {t('editSchedule.edit')}
                        </ButtonOutlined>
                      </div>
                    </div>
                    <div className={classes.summaryDiv}>
                      <div className={classes.innerSumDiv}>
                        <Typography className={classes.col1}>
                          {t(
                            'createWorkflow.verifyCommit.summary.adjustedWeights'
                          )}
                          :
                        </Typography>
                      </div>
                      {weights.length === 0 ? (
                        <div>
                          <Typography className={classes.col2}>
                            {t('createWorkflow.verifyCommit.error')}
                          </Typography>
                        </div>
                      ) : (
                        <div className={classes.adjWeights}>
                          <div className={classes.progress}>
                            {weights.map((Test) => (
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
                          onClick={handleEditOpen}
                        >
                          {t('createWorkflow.verifyCommit.button.viewYaml')}
                        </ButtonFilled>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Cancel and Save Button */}
          <div className={classes.buttonDiv} aria-label="buttons">
            <ButtonOutlined
              onClick={() => {
                history.push({
                  pathname: `/workflows/`,
                  search: `?projectID=${projectID}&projectRole=${userRole}`,
                });
              }}
            >
              {t('editSchedule.cancel')}
            </ButtonOutlined>
            <ButtonFilled
              data-cy="SaveEditScheduleButton"
              onClick={() => handleNext()}
            >
              {t('editSchedule.save')}
            </ButtonFilled>
          </div>

          <Modal
            open={open}
            onClose={handleEditClose}
            width="60%"
            modalActions={
              <ButtonOutlined
                onClick={handleEditClose}
                className={classes.closeBtn}
              >
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
                <img src="./icons/finish.svg" alt="mark" />
                <div className={classes.heading}>
                  {t('editSchedule.theSchedule')}
                  <br />
                  <span className={classes.successful}>{workflow.name}</span>,
                  <br />
                  <span className={classes.bold}>
                    {t('editSchedule.successfullyCreated')}
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
                      tabs.changeWorkflowsTabs(0);
                      history.push({
                        pathname: '/workflows',
                        search: `?projectID=${projectID}&projectRole=${userRole}`,
                      });
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
                <img src="./icons/red-cross.svg" alt="mark" />
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
      )}
    </Scaffold>
  );
};

export default EditSchedule;
