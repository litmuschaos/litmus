import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import Wrapper from '../../containers/layouts/Wrapper';
import { GET_CLUSTER_LENGTH } from '../../graphql';
import { ClusterRequest, Clusters } from '../../models/graphql/clusterData';
import { getUsername } from '../../utils/auth';
import { getProjectID } from '../../utils/getSearchParams';
import useStyles from './styles';

const AgentConfiguredHome = lazy(
  () => import('../../views/Home/AgentConfiguredHome')
);
const LandingHome = lazy(() => import('../../views/Home/LandingHome'));

const HomePage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data: agentList, loading } = useQuery<Clusters, ClusterRequest>(
    GET_CLUSTER_LENGTH,
    {
      variables: { projectID: getProjectID() },
      fetchPolicy: 'network-only',
    }
  );

  let agentCount = 0;

  if (agentList !== undefined) {
    agentCount = agentList?.getClusters.length;
  }

  return (
    <Wrapper>
      <Typography variant="h3" className={classes.userName}>
        {t('home.heading')} {getUsername()}
      </Typography>
      {loading ? (
        <div style={{ height: '100vh' }}>
          <Loader />
        </div>
      ) : agentList && agentCount > 0 ? (
        <AgentConfiguredHome agentCount={agentCount} />
      ) : (
        <LandingHome />
      )}
    </Wrapper>
  );
};

export default HomePage;
