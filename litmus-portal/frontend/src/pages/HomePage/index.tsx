import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { GET_CLUSTER_LENGTH } from '../../graphql';
import { Clusters, ClusterVars } from '../../models/graphql/clusterData';
import { getUsername } from '../../utils/auth';
import { getProjectID } from '../../utils/getSearchParams';
import { AgentConfiguredHome } from '../../views/Home/AgentConfiguredHome';
import { LandingHome } from '../../views/Home/LandingHome';
import useStyles from './styles';

const HomePage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data: agentList, loading } = useQuery<Clusters, ClusterVars>(
    GET_CLUSTER_LENGTH,
    {
      variables: { project_id: getProjectID() },
      fetchPolicy: 'network-only',
    }
  );

  let agentCount = 0;

  if (agentList !== undefined) {
    agentCount = agentList.getCluster.length;
  }

  return (
    <Scaffold>
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
    </Scaffold>
  );
};

export default HomePage;
