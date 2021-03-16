import { CardActionArea, Typography, useTheme } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { LitmusCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateSelectionActions } from '../../models/redux/template';
import { WorkflowActions } from '../../models/redux/workflow';
import useActions from '../../redux/actions';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

const CreateWorkflowCard: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const template = useActions(TemplateSelectionActions);
  const projectID = getProjectID();
  const userRole = getProjectRole();

  const workflowAction = useActions(WorkflowActions);
  const handleCreateWorkflow = () => {
    workflowAction.setWorkflowDetails({
      isCustomWorkflow: false,
      customWorkflows: [],
    });
    template.selectTemplate({ selectedTemplateID: 0, isDisable: true });
    history.push({
      pathname: '/create-workflow',
      search: `?projectID=${projectID}&projectRole=${userRole}`,
    });
  };

  return (
    <LitmusCard
      width="15rem"
      height="100%"
      borderColor={useTheme().palette.highlight}
      data-cy="createWorkflow"
    >
      <div
        aria-hidden="true"
        style={{ height: '100%' }}
        onClick={handleCreateWorkflow}
      >
        <CardActionArea classes={{ root: classes.cardAreaBody }}>
          <Typography className={classes.createWorkflowHeading}>
            {t('home.workflow.heading')}
          </Typography>
          <Typography className={classes.createWorkflowTitle}>
            {t('home.workflow.info')}
          </Typography>
          <ArrowForwardIcon className={classes.arrowForwardIcon} />
        </CardActionArea>
      </div>
    </LitmusCard>
  );
};

export { CreateWorkflowCard };
