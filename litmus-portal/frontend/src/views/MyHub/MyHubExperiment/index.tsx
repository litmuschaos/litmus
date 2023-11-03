import { useQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DeveloperGuide from '../../../components/DeveloperGuide';
import ExperimentInfo from '../../../components/ExperimentInfo';
import InstallChaos from '../../../components/InstallChaos';
import Loader from '../../../components/Loader';
import UsefulLinks from '../../../components/UsefulLinks';
import config from '../../../config';
import Wrapper from '../../../containers/layouts/Wrapper';
import { GET_EXPERIMENT_DATA, GET_HUB_STATUS } from '../../../graphql';
import {
  ExperimentDetail,
  HubStatus,
  Link,
} from '../../../models/graphql/chaoshub';
import { getProjectID } from '../../../utils/getSearchParams';
import ExperimentHeader from '../ExperimentHeader';
import useStyles from './styles';

interface URLParams {
  chart: string;
  experiment: string;
  hubname: string;
}

const MyHub = () => {
  const classes = useStyles();
  // Get Parameters from URL
  const paramData: URLParams = useParams();
  const projectID = getProjectID();
  // Get all MyHubs with status
  const { data: hubDetails } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  // Filter the selected MyHub
  const UserHub = hubDetails?.listHubStatus.filter((myHub) => {
    return paramData.hubname === myHub.hubName;
  })[0];

  // Query to get charts of selected MyHub
  const { data, loading } = useQuery<ExperimentDetail>(GET_EXPERIMENT_DATA, {
    variables: {
      request: {
        hubName: paramData.hubname,
        projectID,
        chartName: paramData.chart,
        experimentName: paramData.experiment,
        fileType: 'CSV',
      },
    },
    fetchPolicy: 'cache-and-network',
  });
  const experimentData = data?.getHubExperiment;

  // State for default video URL
  let videoURL: string = '';
  const video = data?.getHubExperiment.spec.links.filter(
    (l: Link) => l.name === 'Video'
  )[0];
  videoURL = video ? video.url : '';

  // State for default icon URL
  const experimentDefaultImagePath = `${config.grahqlEndpoint}/icon`;
  const imageURL = `${experimentDefaultImagePath}/${projectID}/${paramData.hubname}/${paramData.chart}/${paramData.experiment}.png`;

  const { t } = useTranslation();

  return (
    <Wrapper>
      {loading ? (
        <Loader />
      ) : (
        <div className={classes.rootContainer}>
          <div className={classes.mainDiv}>
            <div className={classes.headerDiv}>
              {/* Exp title + Description */}
              <div className={classes.expMain}>
                <ExperimentHeader
                  title={experimentData?.metadata.name}
                  description={
                    experimentData?.spec.categoryDescription.split('.')[0]
                  }
                  urlToIcon={imageURL}
                />
              </div>
            </div>
          </div>
          {/* Developer Guide Component */}
          {paramData.chart.toLowerCase() !== 'predefined' && (
            <div className={classes.developerDiv}>
              <DeveloperGuide
                expAvailable
                header={t('myhub.experimentPage.congrats')}
                description=""
              />
            </div>
          )}
          {/* Experiment Info */}
          <div className={classes.detailDiv}>
            <div className={classes.expInfo}>
              <div className={classes.expInfoDiv}>
                <ExperimentInfo
                  description={experimentData?.spec.categoryDescription}
                  videoURL={videoURL}
                />
                <div className={classes.installExp}>
                  <hr className={classes.horizontalLine} />
                  <div>
                    <div className={classes.note}>PRE-REQUISITE:</div>
                    <div className={classes.linkText}>
                      <a href="https://docs.litmuschaos.io/" target="_">
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
                  links={experimentData?.spec.links}
                  maintainers={experimentData?.spec.maintainers}
                  platforms={experimentData?.spec.platforms}
                  maturity={experimentData?.spec.maturity}
                />
              </div>
            </div>
            {/* Install Chaos Section */}
            {paramData.chart.toLowerCase() !== 'predefined' ? (
              <div className={classes.installLinks}>
                <InstallChaos
                  title={t('myhub.experimentPage.installExp')}
                  description={t('myhub.experimentPage.installExpDesc')}
                  yamlLink={`${UserHub?.repoURL}/raw/${UserHub?.repoBranch}/experiments/${paramData.chart}/${paramData.experiment}/experiment.yaml`}
                />
                <InstallChaos
                  title={t('myhub.experimentPage.installRBAC')}
                  description={t('myhub.experimentPage.installRBACDesc')}
                  yamlLink={`${UserHub?.repoURL}/raw/${UserHub?.repoBranch}/experiments/${paramData.chart}/${paramData.experiment}/rbac.yaml`}
                />
                <InstallChaos
                  title={t('myhub.experimentPage.installEngine')}
                  description={t('myhub.experimentPage.installEngineDesc')}
                  yamlLink={`${UserHub?.repoURL}/raw/${UserHub?.repoBranch}/experiments/${paramData.chart}/${paramData.experiment}/engine.yaml`}
                />
              </div>
            ) : (
              <>
                <InstallChaos
                  title={t('myhub.experimentPage.checkPreDefined')}
                  description={t('myhub.experimentPage.checkPreDefinedDesc')}
                  yamlLink={`${UserHub?.repoURL}/raw/${UserHub?.repoBranch}/scenarios/${paramData.experiment}`}
                  isPredefined
                />
              </>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default MyHub;
