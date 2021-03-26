import { useQuery } from '@apollo/client';
import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { GET_CLUSTER } from '../../../../graphql';
import { Clusters, ClusterVars } from '../../../../models/graphql/clusterData';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

const AgentCard: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Apollo query to get the agent data
  const { data: agentList } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
    variables: { project_id: getProjectID() },
    fetchPolicy: 'network-only',
  });

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <div className={classes.agentFlex}>
        <div className={classes.agentCountDiv}>
          <Typography className={classes.agentCount}>
            {agentList?.getCluster.length}
          </Typography>
          <Typography className={classes.agentText}>
            {agentList?.getCluster.length !== 1
              ? t('home.NonAdmin.agents')
              : t('home.NonAdmin.agent')}
          </Typography>
        </div>

        <div className={classes.agentDesc}>
          <Typography>{t('home.NonAdmin.chaosAgentInfo')}</Typography>
        </div>
      </div>
      <ButtonFilled
        className={classes.deployButton}
        onClick={() => {
          history.push({
            pathname: '/targets',
            search: `?projectID=${getProjectID()}&projectRole=${getProjectRole()}`,
          });
        }}
      >
        {t('home.NonAdmin.deployFirst')}
      </ButtonFilled>
    </Paper>
  );
};

export default AgentCard;
