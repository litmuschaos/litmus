import { useLazyQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import YamlEditor from '../../../components/YamlEditor/Editor';
import Row from '../../../containers/layouts/Row';
import Width from '../../../containers/layouts/Width';
import {
  GET_CHARTS_DATA,
  GET_ENGINE_YAML,
  GET_EXPERIMENT_YAML,
  GET_TEMPLATE_BY_ID,
} from '../../../graphql/queries';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import { CustomYAML } from '../../../models/redux/customyaml';
import { Charts } from '../../../models/redux/myhub';
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import capitalize from '../../../utils/capitalize';
import { getProjectID } from '../../../utils/getSearchParams';
import { updateEngineName, updateNamespace } from '../../../utils/yamlUtils';
import AddExperimentModal from './AddExperimentModal';
import useStyles from './styles';
import WorkflowPreview from './WorkflowPreview';
import WorkflowSequence from './WorkflowSequence';
import WorkflowTable from './WorkflowTable';

interface WorkflowProps {
  name: string;
  crd: string;
  description: string;
}

interface WorkflowExperiment {
  ChaosEngine: string;
  Experiment: string;
}

interface ManifestSteps {
  name: string;
  template: string;
}

interface StepType {
  [key: string]: ManifestSteps[];
}

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface ChildRef {
  onNext: () => void;
}

interface WorkflowExperiment {
  ChaosEngine: string;
  Experiment: string;
}

const TuneWorkflow = forwardRef((_, ref) => {
  const classes = useStyles();
  const childRef = useRef<ChildRef>();
  /**
   * State Variables for Tune Workflow
   */
  const [hubName, setHubName] = useState<string>('');
  const [experiment, setExperiment] = useState<WorkflowExperiment[]>([]);
  const [allExperiments, setAllExperiments] = useState<ChartName[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [selectedExp, setSelectedExp] = useState('');
  const selectedProjectID = getProjectID();
  const [addExpModal, setAddExpModal] = useState(false);
  const [editManifest, setEditManifest] = useState('');
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [yamlValid, setYamlValid] = useState(true);
  const [editSequence, setEditSequence] = useState(false);
  const [steps, setSteps] = useState<StepType>({});
  const [workflow, setWorkflow] = useState<WorkflowProps>({
    name: '',
    crd: '',
    description: '',
  });
  const { manifest, isCustomWorkflow } = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const { namespace } = useSelector((state: RootState) => state.workflowData);

  const [YAMLModal, setYAMLModal] = useState<boolean>(false);

  /**
   * Actions
   */
  const workflowAction = useActions(WorkflowActions);
  const alert = useActions(AlertActions);

  const { t } = useTranslation();

  /**
   * Graphql query to get charts
   */
  const [getCharts] = useLazyQuery<Charts>(GET_CHARTS_DATA, {
    onCompleted: (data) => {
      const allExp: ChartName[] = [];
      data.getCharts.forEach((data) => {
        return data.Spec.Experiments?.forEach((experiment) => {
          allExp.push({
            ChaosName: data.Metadata.Name,
            ExperimentName: experiment,
          });
        });
      });
      setAllExperiments([...allExp]);
    },
    fetchPolicy: 'cache-and-network',
  });

  /**
   * Graphql query to get the templates list
   */
  const [getTemplate] = useLazyQuery(GET_TEMPLATE_BY_ID, {
    onCompleted: (data) => {
      const parsedYAML = YAML.parse(data.GetTemplateManifestByID.manifest);
      const wfmanifest = updateEngineName(YAML.parse(parsedYAML));
      const updatedManifest = updateNamespace(wfmanifest, namespace);
      workflowAction.setWorkflowManifest({
        manifest: YAML.stringify(updatedManifest),
      });
    },
  });

  const [installAllExp, setInstallAllExp] = useState<string>('');

  useLayoutEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then(
        (value) =>
          value !== null &&
          (value as ChooseWorkflowRadio).selected === 'C' &&
          setSelectedRadio('C')
      );
  }, []);

  /**
   * Default Manifest Template
   */
  const yamlTemplate: CustomYAML = {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      name: `${workflow.name}-${Math.round(new Date().getTime() / 1000)}`,
      namespace,
    },
    spec: {
      arguments: {
        parameters: [
          {
            name: 'adminModeNamespace',
            value: namespace,
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
          name: 'custom-chaos',
          steps: [
            [
              {
                name: 'install-chaos-experiments',
                template: 'install-chaos-experiments',
              },
            ],
          ],
        },
        {
          name: 'install-chaos-experiments',
          inputs: {
            artifacts: [],
          },
          container: {
            args: [`${installAllExp}`],
            command: ['sh', '-c'],
            image: 'litmuschaos/k8s:latest',
          },
        },
      ],
    },
  };

  /**
   * Generated YAML for custom workflows
   */
  const [generatedYAML, setGeneratedYAML] = useState<CustomYAML>(
    manifest === '' ? yamlTemplate : YAML.parse(manifest)
  );

  /**
   * This function fetches the manifest for pre-defined workflows
   */
  const fetchYaml = (link: string) => {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          const wfmanifest = updateEngineName(YAML.parse(yamlText));
          const updatedManifest = updateNamespace(wfmanifest, namespace);
          workflowAction.setWorkflowManifest({
            manifest: YAML.stringify(updatedManifest),
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /**
   * Index DB Fetching for extracting selected Button and Workflow Details
   */
  const getSelectedWorkflowDetails = () => {
    localforage.getItem('workflow').then((workflow) =>
      setWorkflow({
        name: (workflow as WorkflowDetailsProps).name,
        crd: (workflow as WorkflowDetailsProps).CRDLink,
        description: (workflow as WorkflowDetailsProps).description,
      })
    );
    localforage.getItem('selectedScheduleOption').then((value) => {
      /**
       * Setting default data when MyHub is selected
       */
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'A') {
        localforage.getItem('workflow').then((value) => {
          if (
            value !== null &&
            (value as WorkflowDetailsProps).CRDLink !== '' &&
            manifest === ''
          )
            fetchYaml((value as WorkflowDetailsProps).CRDLink);
        });
      }
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'B') {
        localforage.getItem('selectedScheduleOption').then((value) => {
          if (
            value !== null &&
            (value as ChooseWorkflowRadio).id !== '' &&
            manifest === ''
          ) {
            getTemplate({
              variables: {
                data: (value as ChooseWorkflowRadio).id,
              },
            });
          }
        });
      }
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'C') {
        localforage.getItem('selectedHub').then((hub) => {
          setHubName(hub as string);
          getCharts({
            variables: { projectID: selectedProjectID, HubName: hub as string },
          });
        });
      }
    });
  };

  useEffect(() => {
    getSelectedWorkflowDetails();
  }, []);

  /**
   * Graphql Query for fetching Engine YAML
   */
  const [
    getEngineYaml,
    { data: engineData, loading: engineDataLoading },
  ] = useLazyQuery(GET_ENGINE_YAML, {
    fetchPolicy: 'network-only',
  });

  /**
   * Graphql Query for fetching Experiment YAML
   */
  const [
    getExperimentYaml,
    { data: experimentData, loading: experimentDataLoading },
  ] = useLazyQuery(GET_EXPERIMENT_YAML, {
    fetchPolicy: 'network-only',
  });

  /**
   * On Clicking the Done button present at Add Experiment Modal this function will get triggered
   * Click => Done
   * Function => handleDone()
   * */
  const handleDone = () => {
    getExperimentYaml({
      variables: {
        experimentInput: {
          ProjectID: selectedProjectID,
          HubName: hubName,
          ChartName: selectedExp.split('/')[0],
          ExperimentName: selectedExp.split('/')[1],
          FileType: 'experiment',
        },
      },
    });
    getEngineYaml({
      variables: {
        experimentInput: {
          ProjectID: selectedProjectID,
          HubName: hubName,
          ChartName: selectedExp.split('/')[0],
          ExperimentName: selectedExp.split('/')[1],
          FileType: 'engine',
        },
      },
    });

    setAddExpModal(false);
  };

  /**
   * UpdateCRD is used to updated the manifest while adding experiments from MyHub
   */
  const updateCRD = (crd: CustomYAML, experiment: WorkflowExperiment[]) => {
    const generatedYAML: CustomYAML = crd;
    let installAll = '';
    const modifyYAML = (link: string) => {
      const steps = generatedYAML.spec.templates[0]?.steps;
      if (steps !== undefined)
        steps.push([
          {
            name: YAML.parse(link as string).metadata.name,
            template: YAML.parse(link as string).metadata.name,
          },
        ]);
      installAll = `${installAllExp}kubectl apply -f /tmp/${
        YAML.parse(link as string).metadata.name
      }.yaml -n {{workflow.parameters.adminModeNamespace}} | `;
      const arg = generatedYAML.spec.templates[1]?.container;
      if (arg !== undefined) arg.args = [`${installAll} sleep 30`];
      setInstallAllExp(installAll);
    };

    experiment.forEach((exp) => {
      modifyYAML(Object.values(exp.Experiment)[0]);
    });

    /**
     * Step to add experiment and engine YAMLs of all experiments
     */
    experiment.forEach((data) => {
      /**
       * Adding experiment YAML
       */
      const ExperimentYAML = YAML.parse(Object.values(data.Experiment)[0]);
      const artifacts = generatedYAML.spec.templates[1].inputs?.artifacts;
      if (artifacts !== undefined) {
        artifacts.push({
          name: ExperimentYAML.metadata.name,
          path: `/tmp/${ExperimentYAML.metadata.name}.yaml`,
          raw: {
            data: YAML.stringify(ExperimentYAML),
          },
        });
      }

      /**
       * Adding engine YAML
       */
      const ChaosEngine = YAML.parse(Object.values(data.ChaosEngine)[0]);
      const ExpName = YAML.parse(Object.values(data.Experiment)[0]).metadata
        .name;
      ChaosEngine.metadata.name = `${
        YAML.parse(Object.values(data.Experiment)[0]).metadata.name
      }-${Math.round(new Date().getTime() / 1000)}`;
      ChaosEngine.metadata.namespace =
        '{{workflow.parameters.adminModeNamespace}}';
      ChaosEngine.spec.chaosServiceAccount = 'litmus-admin';
      generatedYAML.spec.templates.push({
        name: ExpName,
        inputs: {
          artifacts: [
            {
              name: ExpName,
              path: `/tmp/chaosengine-${ExpName}.yaml`,
              raw: {
                data: YAML.stringify(ChaosEngine),
              },
            },
          ],
        },
        container: {
          args: [
            `-file=/tmp/chaosengine-${ExpName}.yaml`,
            `-saveName=/tmp/engine-name`,
          ],
          image: 'litmuschaos/litmus-checker:latest',
        },
      });
    });
    return generatedYAML;
  };

  /**
   * UseEffect to make changes in the generated YAML
   * when a new experiment is added from MyHub
   */
  useEffect(() => {
    if (isCustomWorkflow) {
      const savedManifest =
        manifest !== '' ? YAML.parse(manifest) : generatedYAML;
      const updatedManifest = updateCRD(savedManifest, experiment);
      setGeneratedYAML(updatedManifest);
      workflowAction.setWorkflowManifest({
        manifest: YAML.stringify(updatedManifest),
      });
    }
  }, [experiment]);

  const onModalClose = () => {
    setAddExpModal(false);
  };

  const onSelectChange = (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setSelectedExp(e.target.value as string);
  };

  useEffect(() => {
    if (engineData !== undefined && experimentData !== undefined) {
      setExperiment([
        {
          ChaosEngine: engineData,
          Experiment: experimentData,
        },
      ]);
    }
  }, [engineDataLoading, experimentDataLoading]);

  function onNext() {
    if (childRef.current) {
      if ((childRef.current.onNext() as unknown) === false) {
        alert.changeAlertState(true); // Custom Workflow has no experiments
        return false;
      }
    }
    return true;
  }

  const handleSteps = (steps: any) => {
    setSteps(steps);
  };

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  const LeftButtonWrapper = () => (
    <>
      <ButtonOutlined
        onClick={() => {
          setYAMLModal(true);
          setConfirmEdit(false);
        }}
        className={classes.editBtn}
      >
        <img src="./icons/viewYAMLicon.svg" alt="view YAML" />
        <Width width="1rem" /> {t('createWorkflow.tuneWorkflow.edit')}
      </ButtonOutlined>
      <Modal
        open={YAMLModal}
        onClose={() => {
          setYAMLModal(false);
        }}
        width="60%"
        modalActions={
          <ButtonOutlined
            onClick={() => {
              if (editManifest === '') {
                setYAMLModal(false);
              } else {
                setConfirmEdit(true);
              }
            }}
            className={classes.closeBtn}
          >
            <img src="./icons/cross-disabled.svg" alt="cross" />
          </ButtonOutlined>
        }
      >
        <div className={classes.saveTemplateRoot}>
          {confirmEdit ? (
            <div className={classes.confirmDiv}>
              <Typography className={classes.confirmText}>
                {t('createWorkflow.tuneWorkflow.confirmText')}
              </Typography>
              <ButtonOutlined
                className={classes.backBtn}
                disabled={!yamlValid}
                onClick={() => {
                  setConfirmEdit(false);
                }}
              >
                {t('createWorkflow.tuneWorkflow.back')}
              </ButtonOutlined>
              <ButtonFilled
                className={classes.continueBtn}
                disabled={!yamlValid}
                onClick={() => {
                  setYAMLModal(false);
                  setEditManifest('');
                }}
              >
                {t('createWorkflow.tuneWorkflow.continue')}
              </ButtonFilled>
            </div>
          ) : (
            <>
              <Typography className={classes.updateText}>
                {t('createWorkflow.tuneWorkflow.updateChanges')}
              </Typography>
              <YamlEditor
                content={manifest}
                filename={workflow.name}
                readOnly={false}
                setButtonState={(btnState: boolean) => {
                  setYamlValid(btnState);
                }}
                saveWorkflowChange={(updatedManifest: string) => {
                  setEditManifest(updatedManifest);
                }}
              />
              <ButtonFilled
                className={classes.continueBtn}
                disabled={!yamlValid}
                onClick={() => {
                  workflowAction.setWorkflowManifest({
                    manifest: editManifest === '' ? manifest : editManifest,
                  });
                  setEditManifest('');
                  setYAMLModal(false);
                }}
              >
                {t('createWorkflow.tuneWorkflow.saveChange')}
              </ButtonFilled>
            </>
          )}
        </div>
      </Modal>
    </>
  );

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.headerWrapper}>
        <Typography className={classes.heading}>
          {t('createWorkflow.tuneWorkflow.header')}
        </Typography>
        <Row className={classes.descriptionWrapper}>
          <Typography className={classes.description}>
            {t('createWorkflow.tuneWorkflow.selectedWorkflowInfo')}{' '}
            <i>
              <strong>
                {workflow.name.split('-').map((text) => `${capitalize(text)} `)}
              </strong>
            </i>
            <br />
            {t('createWorkflow.tuneWorkflow.description')}
          </Typography>
          {selectedRadio === 'C' ? (
            <div className={classes.headerBtn}>
              {LeftButtonWrapper()}
              <ButtonOutlined
                onClick={() => {
                  setSelectedExp('');
                  setAddExpModal(true);
                }}
              >
                {t('createWorkflow.tuneWorkflow.addANewExperiment')}
              </ButtonOutlined>
            </div>
          ) : (
            <>{LeftButtonWrapper()}</>
          )}
        </Row>
      </div>

      {/* Add Experiment Modal */}
      <AddExperimentModal
        addExpModal={addExpModal}
        onModalClose={onModalClose}
        hubName={hubName}
        selectedExp={selectedExp}
        onSelectChange={onSelectChange}
        allExperiments={allExperiments}
        handleDone={handleDone}
      />

      {/* Experiment Details */}
      <div className={classes.experimentWrapper}>
        {/* Edit Button */}
        {manifest !== '' && (
          <ButtonOutlined onClick={() => setEditSequence(true)}>
            <img src="./icons/editsequence.svg" alt="Edit Sequence" />{' '}
            <Width width="0.5rem" />
            {t('createWorkflow.tuneWorkflow.editSequence')}
          </ButtonOutlined>
        )}
        <Modal
          open={editSequence}
          onClose={() => {
            setEditSequence(false);
          }}
          width="60%"
          modalActions={
            <ButtonOutlined
              onClick={() => {
                setEditSequence(false);
              }}
              className={classes.closeBtn}
            >
              <img src="./icons/cross-disabled.svg" alt="cross" />
            </ButtonOutlined>
          }
        >
          <div className={classes.sequenceMainDiv}>
            <div className={classes.sequenceDiv}>
              <Typography variant="h4">
                {t('createWorkflow.tuneWorkflow.editSequence')}
              </Typography>
              <Typography className={classes.dropText}>
                {t('createWorkflow.tuneWorkflow.dragndrop')}
              </Typography>
            </div>
            <Row>
              <Width width="40%">
                <WorkflowPreview
                  SequenceSteps={steps}
                  isCustomWorkflow={isCustomWorkflow}
                />
              </Width>
              <Width width="60%">
                <WorkflowSequence
                  getSteps={handleSteps}
                  handleSequenceModal={(sequenceState: boolean) => {
                    setEditSequence(sequenceState);
                  }}
                />
              </Width>
            </Row>
          </div>
        </Modal>
        {/* Details Section -> Graph on the Left and Table on the Right */}
        <Row>
          {/* Argo Workflow Graph */}
          <Width width="30%">
            <WorkflowPreview isCustomWorkflow={isCustomWorkflow} />
          </Width>
          {/* Workflow Table */}
          <Width width="70%">
            <WorkflowTable ref={childRef} isCustom={isCustomWorkflow} />
          </Width>
        </Row>
      </div>
    </div>
  );
});

export default TuneWorkflow;
