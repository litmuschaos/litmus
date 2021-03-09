import { useLazyQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  GET_CHARTS_DATA,
  GET_ENGINE_YAML,
  GET_EXPERIMENT_YAML,
} from '../../../graphql/queries';
import useStyles from './styles';
import { Charts } from '../../../models/redux/myhub';
import { RootState } from '../../../redux/reducers';
import AddExperimentModal from './AddExperimentModal';

interface ChooseWorkflowRadio {
  selected: string;
  id?: string;
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
  const { t } = useTranslation();

  // State Variables for Tune Workflow
  const [hubName, setHubName] = useState<string>('');
  const [experiment, setExperiment] = useState<WorkflowExperiment[]>([]);
  const [allExperiments, setAllExperiments] = useState<ChartName[]>([]);
  const [selectedExp, setSelectedExp] = useState('');
  const { selectedProjectID } = useSelector(
    (state: RootState) => state.userData
  );
  const [addExpModal, setAddExpModal] = useState(false);

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
    /** Retrieving saved data from index DB,
     *  if user has already edited the details then it will fetch the stored data
     *  and call checkForStoredData()
     *  else it will initializeWithDefault()
     */
    localforage.getItem('selectedScheduleOption').then((value) => {
      // Map over the list of predefined workflows and extract the name and detail
      if ((value as ChooseWorkflowRadio).selected === 'A') {
        return null;
      }
      if ((value as ChooseWorkflowRadio).selected === 'B') {
        return null;
      }
      // Setting default data when MyHub is selected
      if ((value as ChooseWorkflowRadio).selected === 'C') {
        localforage.getItem('selectedHub').then((hub) => {
          setHubName(hub as string);
          getCharts({
            variables: { projectID: selectedProjectID, HubName: hub as string },
          });
        });
      }
      // Setting default data when Upload is selected
      if ((value as ChooseWorkflowRadio).selected === 'D') {
        return null;
      }
      return null;
    });
  }, []);

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.headerWrapper}>
        <Typography className={classes.heading}>
          {t('createWorkflow.tuneWorkflow.header')}
        </Typography>
        <div style={{ display: 'flex' }}>
          <Typography className={classes.description}>
            {t('createWorkflow.tuneWorkflow.selectedWorkflowInfo')}
            <br />
            {t('createWorkflow.tuneWorkflow.description')}
          </Typography>
          <ButtonOutlined style={{ marginRight: 20 }} onClick={() => {}}>
            View YAML
          </ButtonOutlined>
          <ButtonOutlined
            onClick={() => {
              setSelectedExp('');
              setAddExpModal(true);
            }}
          >
            Add experiments
          </ButtonOutlined>
        </div>

        {experiment.length ? (
          <>{/* Display Table Here */}</>
        ) : (
          <ButtonFilled onClick={() => setAddExpModal(true)}>
            Add your first experiment
          </ButtonFilled>
        )}
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
    </div>
  );
};

export default TuneWorkflow;
