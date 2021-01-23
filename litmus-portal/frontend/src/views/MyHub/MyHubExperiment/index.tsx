import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../../containers/layouts/Scaffold';
import useStyles from './styles';
import { RootState } from '../../../redux/reducers';
import ExperimentHeader from '../../../components/ExperimentHeader';
import DeveloperGuide from '../../../components/DeveloperGuide';
import ExperimentInfo from '../../../components/ExperimentInfo';
import UsefulLinks from '../../../components/UsefulLinks';
import InstallChaos from '../../../components/InstallChaos';
import { GET_EXPERIMENT_DATA, GET_HUB_STATUS } from '../../../graphql';
import { ExperimentDetail, HubStatus, Link } from '../../../models/redux/myhub';
import Loader from '../../../components/Loader';

interface URLParams {
  chart: string;
  experiment: string;
  hubname: string;
}

const MyHub = () => {
  const classes = useStyles();

  // User Data from Redux
  const userData = useSelector((state: RootState) => state.userData);

  // Get all MyHubs with status
  const { data: hubDetails } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: userData.selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  // Get Parameters from URL
  const paramData: URLParams = useParams();

  // Filter the selected MyHub
  const UserHub = hubDetails?.getHubStatus.filter((myHub) => {
    return paramData.hubname === myHub.HubName;
  })[0];

  // Query to get charts of selected MyHub
  const { data, loading } = useQuery<ExperimentDetail>(GET_EXPERIMENT_DATA, {
    variables: {
      data: {
        HubName: paramData.hubname,
        ProjectID: userData.selectedProjectID,
        ChartName: paramData.chart,
        ExperimentName: paramData.experiment,
      },
    },
    fetchPolicy: 'cache-and-network',
  });
  const experimentData = data?.getHubExperiment;

  // State for default video URL
  let videoURL: string = '';
  const video = data?.getHubExperiment.Spec.Links.filter(
    (l: Link) => l.Name === 'Video'
  )[0];
  videoURL = video ? video.Url : '';

  // State for default icon URL
  const urltoIcon = `${UserHub?.RepoURL}/raw/${UserHub?.RepoBranch}/charts/${paramData.chart}/icons/${paramData.experiment}.png`;

  const { t } = useTranslation();

  return (
    <Scaffold>
      {loading ? (
        <Loader />
      ) : (
        <div className={classes.rootContainer}>
          <div className={classes.mainDiv}>
            <div className={classes.headerDiv}>
              {/* Exp title + Description */}
              <div className={classes.expMain}>
                <ExperimentHeader
                  title={experimentData?.Metadata.Name}
                  description={
                    experimentData?.Spec.CategoryDescription.split('.')[0]
                  }
                  urlToIcon={urltoIcon}
                />
              </div>
            </div>
          </div>
          {/* Developer Guide Component */}
          <div className={classes.developerDiv}>
            <DeveloperGuide
              expAvailable
              header={t('myhub.experimentPage.congrats')}
              description=""
            />
          </div>
          {/* Experiment Info */}
          <div className={classes.detailDiv}>
            <div className={classes.expInfo}>
              <div className={classes.expInfoDiv}>
                <ExperimentInfo
                  description={experimentData?.Spec.CategoryDescription}
                  videoURL={videoURL}
                />
                <div className={classes.installExp}>
                  <hr className={classes.horizontalLine} />
                  <div>
                    <div className={classes.note}>PRE-REQUISITE:</div>
                    <div className={classes.linkText}>
                      <a
                        href="https://docs.litmuschaos.io/docs/getstarted/"
                        target="_"
                      >
                        Install Litmus Operator
                      </a>
                      : a tool for injecting Chaos Experiments
                    </div>
                  </div>
                  <hr className={classes.horizontalLine} />
                </div>
              </div>
              {/* Useful Links Section */}
              <div className={classes.info}>
                <UsefulLinks
                  links={experimentData?.Spec.Links}
                  maintainers={experimentData?.Spec.Maintainers}
                  platforms={experimentData?.Spec.Platforms}
                  maturity={experimentData?.Spec.Maturity}
                />
              </div>
            </div>
            {/* Install Chaos Section */}
            <div className={classes.installLinks}>
              <InstallChaos
                title={t('myhub.experimentPage.installExp')}
                description={t('myhub.experimentPage.installExpDesc')}
                yamlLink={`${UserHub?.RepoURL}/raw/${UserHub?.RepoBranch}/charts/${paramData.chart}/${paramData.experiment}/experiment.yaml`}
              />
              <InstallChaos
                title={t('myhub.experimentPage.installRBAC')}
                description={t('myhub.experimentPage.installRBACDesc')}
                yamlLink={`${UserHub?.RepoURL}/raw/${UserHub?.RepoBranch}/charts/${paramData.chart}/${paramData.experiment}/rbac.yaml`}
              />
              <InstallChaos
                title={t('myhub.experimentPage.installEngine')}
                description={t('myhub.experimentPage.installEngineDesc')}
                yamlLink={`${UserHub?.RepoURL}/raw/${UserHub?.RepoBranch}/charts/${paramData.chart}/${paramData.experiment}/engine.yaml`}
              />
            </div>
          </div>
        </div>
      )}
    </Scaffold>
  );
};

export default MyHub;
