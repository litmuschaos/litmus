import { useLazyQuery, useQuery } from '@apollo/client';
import { RadioGroup, Typography, useTheme } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {
  ButtonOutlined,
  LitmusCard,
  Modal,
  RadioButton,
  Search,
} from 'litmus-ui';
import React, {
  forwardRef,
  lazy,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import {
  GET_CLUSTER,
  GET_IMAGE_REGISTRY,
  LIST_IMAGE_REGISTRY,
} from '../../../graphql';
import { ImageRegistryInfo } from '../../../models/redux/image_registry';
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import * as ImageRegistryActions from '../../../redux/actions/image_registry';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const AgentDeployModal = lazy(
  () => import('../../../components/AgentDeployModal')
);

interface Cluster {
  clusterName: string;
  isActive: boolean;
  clusterID: string;
  agentNamespace: string;
}

const ChooseWorkflowAgent = forwardRef((_, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { palette } = useTheme();

  const workflow = useActions(WorkflowActions);
  const alert = useActions(AlertActions);
  const imageRegistry = useActions(ImageRegistryActions);
  const clusterid: string = useSelector(
    (state: RootState) => state.workflowData.clusterid
  );
  const selectedProjectID = getProjectID();

  const [clusterData, setClusterData] = useState<Cluster[]>([]);
  const [search, setSearch] = useState<string | null>(null);
  const [currentlySelectedAgent, setCurrentlySelectedAgent] =
    useState<string>('');

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const toggleModel = () => {
    setModalOpen(!modalOpen);
  };

  const [getRegistryData] = useLazyQuery(GET_IMAGE_REGISTRY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data !== undefined) {
        const regData = data.GetImageRegistry
          .image_registry_info as ImageRegistryInfo;
        imageRegistry.selectImageRegistry({
          image_registry_name: regData.image_registry_name,
          image_repo_name: regData.image_repo_name,
          image_registry_type: regData.image_registry_type,
          secret_name: regData.secret_name,
          secret_namespace: regData.secret_namespace,
          enable_registry: regData.enable_registry,
          is_default: regData.is_default,
          update_registry: true,
        });
      }
    },
  });

  useQuery(LIST_IMAGE_REGISTRY, {
    variables: {
      data: selectedProjectID,
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (
        data.ListImageRegistry !== null &&
        data.ListImageRegistry.length > 0
      ) {
        getRegistryData({
          variables: {
            registryid: data.ListImageRegistry[0].image_registry_id,
            projectid: selectedProjectID,
          },
        });
      } else {
        imageRegistry.selectImageRegistry({
          image_registry_name: constants.dockerio,
          image_repo_name: constants.litmus,
          image_registry_type: constants.public,
          secret_name: '',
          secret_namespace: '',
          is_default: true,
          enable_registry: true,
          update_registry: true,
        });
      }
    },
  });

  const [getCluster, { loading }] = useLazyQuery(GET_CLUSTER, {
    onCompleted: (data) => {
      const clusters: Cluster[] = [];
      if (data && data.getCluster.length !== 0) {
        data.getCluster.forEach((e: Cluster) => {
          if (e.isActive === true) {
            // Populating all the cluster data in the clusters[] array
            clusters.push({
              clusterName: e.clusterName,
              isActive: e.isActive,
              clusterID: e.clusterID,
              agentNamespace: e.agentNamespace,
            });
            // Setting the initial workflow yaml to be of type Workflow
            workflow.setWorkflowDetails({
              clusterid: '',
              cronSyntax: '',
              scheduleType: {
                scheduleOnce: 'now',
                recurringSchedule: '',
              },
              scheduleInput: {
                hour_interval: 0,
                day: 1,
                weekday: 'Monday',
                time: new Date(),
                date: new Date(),
              },
              workflowIcon: '',
            });
          }
        });
        setClusterData(clusters);
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  function onNext() {
    if (getProjectRole() === 'Viewer') {
      alert.changeAlertState(true);
      return false;
    }
    if (clusterid === '' || clusterData.length === 0) {
      alert.changeAlertState(true); // No Cluster has been selected and user clicked on Next
      return false;
    }
    return true;
  }

  // Rendering once to get the cluster data
  useEffect(() => {
    getCluster({ variables: { project_id: selectedProjectID } });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentlySelectedAgent(event.target.value);
  };

  // Filter the clusters based on search results
  const filteredCluster = clusterData.filter((cluster: Cluster) => {
    if (search === null) return cluster;
    if (cluster.clusterName.toLowerCase().includes(search.toLowerCase()))
      return cluster;
    return null;
  });

  // Rendering atleast a few times till it updates the currentlySelectedAgent value
  useEffect(() => {
    if (currentlySelectedAgent !== '') {
      clusterData.forEach((cluster) => {
        if (currentlySelectedAgent === cluster.clusterID) {
          workflow.setWorkflowDetails({
            clusterid: cluster.clusterID,
            projectID: selectedProjectID,
            clustername: cluster.clusterName,
            namespace: cluster.agentNamespace,
          });
        }
      });
    }
  }, [currentlySelectedAgent]);

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  return (
    <div className={classes.root}>
      <div className={classes.innerContainer}>
        {/* Header */}
        <div aria-label="header" className={classes.header}>
          <div aria-label="headerLeft">
            <Typography className={classes.title}>
              <strong> {t('workflowAgent.header.chooseAgent')}</strong>
            </Typography>
            <Typography className={classes.subtitle}>
              {t('workflowAgent.header.creatingNew')} <br />
              {t('workflowAgent.header.selectAgent')}
            </Typography>
          </div>
          {/* Dart Icon */}
          <div aria-label="headerRight">
            <img src="./icons/dart.svg" className={classes.check} alt="Check" />
          </div>
        </div>

        <br />
        {/* Search Bar */}
        <Search
          data-cy="agentSearch"
          id="input-with-icon-textfield"
          placeholder={t('workflowAgent.search.placeholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {/* Cluster Data */}
        {loading ? (
          <Loader />
        ) : clusterData.length === 0 ? (
          <div className={classes.noAgents}>
            <Typography className={classes.noAgentsText}>
              <strong>{t('workflowAgent.noAgents')}</strong>
            </Typography>
            <Typography className={classes.connectAgent}>
              {t('workflowAgent.connectAgent')}
            </Typography>
            <div className={classes.connectBtn}>
              <ButtonOutlined
                onClick={toggleModel}
                className={classes.infoContainerButton}
              >
                <Typography>
                  <ArrowUpwardIcon />
                  {t('homeViews.agentConfiguredHome.agentInfoContainer.deploy')}
                </Typography>
              </ButtonOutlined>

              <Modal
                height="50%"
                width="50%"
                open={modalOpen}
                onClose={toggleModel}
                modalActions={
                  <ButtonOutlined onClick={toggleModel}>
                    &#x2715;
                  </ButtonOutlined>
                }
              >
                <AgentDeployModal handleClose={toggleModel} />
              </Modal>
            </div>
          </div>
        ) : (
          <RadioGroup
            name="Agent Selection"
            value={currentlySelectedAgent}
            onChange={(e) => handleChange(e)}
            data-cy="AgentRadioGroup"
          >
            <div className={classes.agentWrapperDiv} data-cy="AgentsRadioGroup">
              {filteredCluster?.length > 0 ? (
                filteredCluster.map((cluster) => (
                  <LitmusCard
                    key={cluster.clusterID}
                    glow={currentlySelectedAgent === cluster.clusterID}
                    width="40%"
                    height="4rem"
                    className={classes.litmusCard}
                    borderColor={
                      currentlySelectedAgent === cluster.clusterID
                        ? palette.primary.main
                        : palette.border.main
                    }
                  >
                    <RadioButton
                      value={cluster.clusterID}
                      className={classes.agentRadioButton}
                      data-cy={cluster.clusterName}
                    >
                      <div>
                        <Typography>{cluster.clusterName}</Typography>
                        <Typography>{cluster.clusterID}</Typography>
                      </div>
                    </RadioButton>
                  </LitmusCard>
                ))
              ) : (
                <div className={classes.noAgentsText}>
                  <Typography>
                    <strong>{t('workflowAgent.noAgentSearch')}</strong>
                  </Typography>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
      </div>
    </div>
  );
});

export default ChooseWorkflowAgent;
