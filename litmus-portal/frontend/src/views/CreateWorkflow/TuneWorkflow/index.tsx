import { useLazyQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import Row from '../../../containers/layouts/Row';
import Width from '../../../containers/layouts/Width';
import {
  GET_CHARTS_DATA,
  GET_ENGINE_YAML,
  GET_EXPERIMENT_YAML,
} from '../../../graphql/queries';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import { CustomYAML } from '../../../models/redux/customyaml';
import { Charts } from '../../../models/redux/myhub';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import capitalize from '../../../utils/capitalize';
import AddExperimentModal from './AddExperimentModal';
import useStyles from './styles';
import { updateCRD } from './UpdateCRD';
import WorkflowPreview from './WorkflowPreview';
import WorkflowTable from './WorkflowTable';

interface WorkflowProps {
  name: string;
}

interface WorkflowExperiment {
  ChaosEngine: string;
  Experiment: string;
}

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();

  // State Variables for Tune Workflow
  const [hubName, setHubName] = useState<string>('');
  const [experiment, setExperiment] = useState<WorkflowExperiment[]>([]); // eslint-disable-line
  const [allExperiments, setAllExperiments] = useState<ChartName[]>([]);
  const [selectedExp, setSelectedExp] = useState('');
  const { selectedProjectID } = useSelector(
    (state: RootState) => state.userData
  );
  const [addExpModal, setAddExpModal] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowProps>({
    name: '',
  });
  const [customWorkflow, setCustomWorkflow] = useState<boolean>(false); // eslint-disable-line

  // Actions
  const workflowAction = useActions(WorkflowActions);

  const { t } = useTranslation();

  // Index DB Fetching for extracting selected Button and Workflow Details
  const getSelectedWorkflowDetails = () => {
    localforage.getItem('workflow').then((workflow) =>
      setWorkflow({
        name: (workflow as WorkflowDetailsProps).name,
      })
    );
  };

  useEffect(() => {
    getSelectedWorkflowDetails();
  }, []);

  // Default CRD
  const yamlTemplate: CustomYAML = {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      name: `${workflow.name}-${Math.round(new Date().getTime() / 1000)}`,
      namespace: `litmus`,
    },
    spec: {
      arguments: {
        parameters: [
          {
            name: 'adminModeNamespace',
            value: `litmus`,
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
  // Graphql Query for fetching Engine YAML
  const [
    getEngineYaml,
    { data: engineData, loading: engineDataLoading },
  ] = useLazyQuery(GET_ENGINE_YAML, {
    fetchPolicy: 'network-only',
  });

  // Graphql Query for fetching Experiment YAML
  const [
    getExperimentYaml,
    { data: experimentData, loading: experimentDataLoading },
  ] = useLazyQuery(GET_EXPERIMENT_YAML, {
    fetchPolicy: 'network-only',
  });

  // Graphql query to get charts
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

  useEffect(() => {
    setGeneratedYAML(updateCRD(generatedYAML, experiment));
    workflowAction.setWorkflowManifest({
      manifest: YAML.stringify(generatedYAML),
    });
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

  // Loading Workflow Related Data for Workflow Settings
  useEffect(() => {
    localforage.getItem('selectedScheduleOption').then((value) => {
      // Setting default data when MyHub is selected
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'A') {
        setCustomWorkflow(false);
      }
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'C') {
        setCustomWorkflow(true);
        localforage.getItem('selectedHub').then((hub) => {
          setHubName(hub as string);
          getCharts({
            variables: { projectID: selectedProjectID, HubName: hub as string },
          });
        });
      }
    });
  }, []);

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
          <div className={classes.headerBtn}>
            <ButtonOutlined className={classes.btn1}>
              <img src="./icons/viewYAMLicon.svg" alt="view YAML" />{' '}
              <Width width="0.5rem" /> {t('createWorkflow.tuneWorkflow.view')}
            </ButtonOutlined>
            <ButtonOutlined
              onClick={() => {
                setSelectedExp('');
                setAddExpModal(true);
              }}
            >
              {t('createWorkflow.tuneWorkflow.addANewExperiment')}
            </ButtonOutlined>
          </div>
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
        <ButtonOutlined>
          <img src="./icons/editsequence.svg" alt="Edit Sequence" />{' '}
          <Width width="0.5rem" />
          {t('createWorkflow.tuneWorkflow.editSequence')}
        </ButtonOutlined>
        {/* Details Section -> Graph on the Left and Table on the Right */}
        <Row>
          {/* Argo Workflow Graph */}
          <Width width="30%">
            <WorkflowPreview />
          </Width>
          {/* Workflow Table */}
          <Width width="70%">
            {experiment.length > 0 ? (
              <WorkflowTable isCustom />
            ) : (
              <WorkflowTable />
            )}
          </Width>
        </Row>
      </div>
    </div>
  );
};

export default TuneWorkflow;
