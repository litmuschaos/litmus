import { useQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ThreeTierCard } from '../../../../components/ThreeTierCard';
import { GET_CLUSTER } from '../../../../graphql';
import { Clusters, ClusterVars } from '../../../../models/graphql/clusterData';
import useActions from '../../../../redux/actions';
import * as TemplateSelectionActions from '../../../../redux/actions/template';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { history } from '../../../../redux/configureStore';
import { RootState } from '../../../../redux/reducers';
import useStyles from '../styles';

const AnalyticsScheduleWorkflowCard: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const template = useActions(TemplateSelectionActions);
  const workflowAction = useActions(WorkflowActions);
  const userData = useSelector((state: RootState) => state.userData);
  // Apollo query to get the agent data
  const { data: agentList } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
    variables: { project_id: userData.selectedProjectID },
    fetchPolicy: 'network-only',
  });
  const handleCreateWorkflow = () => {
    workflowAction.setWorkflowDetails({
      isCustomWorkflow: false,
      customWorkflows: [],
    });
    template.selectTemplate({ selectedTemplateID: 0, isDisable: true });
    history.push('/create-workflow');
  };
  return (
    <div className={classes.banner}>
      <ThreeTierCard
        isDisabled={!(agentList && agentList?.getCluster.length > 0)}
        mainHeading={[
          t('analyticsDashboard.scheduleWorkflowCard.mainHeading-0'),
          t('analyticsDashboard.scheduleWorkflowCard.mainHeading-1'),
          t('analyticsDashboard.scheduleWorkflowCard.mainHeading-2'),
        ]}
        subHeading={t('analyticsDashboard.scheduleWorkflowCard.subHeading')}
        description={t('analyticsDashboard.scheduleWorkflowCard.description')}
        buttonText={t('analyticsDashboard.scheduleWorkflowCard.buttonText')}
        handleClick={handleCreateWorkflow}
      />
    </div>
  );
};
export { AnalyticsScheduleWorkflowCard };
