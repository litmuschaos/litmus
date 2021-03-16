import { Card, CardActionArea, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useActions from '../../redux/actions';
import * as TemplateSelectionActions from '../../redux/actions/template';
import * as WorkflowActions from '../../redux/actions/workflow';
import { history } from '../../redux/configureStore';
import { ReactComponent as Arrow } from '../../svg/arrow.svg';
import { ReactComponent as ArrowDisabled } from '../../svg/arrow_disabled.svg';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

interface CreateWorkflowCardProps {
  isDisabled: boolean;
}

const CreateWorkflowCard: React.FC<CreateWorkflowCardProps> = ({
  isDisabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles({ isDisabled });
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
    <Card
      onClick={isDisabled ? () => {} : handleCreateWorkflow}
      className={classes.createCard}
      data-cy="createWorkflow"
    >
      <CardActionArea className={classes.createCardAction}>
        <Typography className={classes.createCardHeading}>
          {t('home.workflow.heading')}
        </Typography>
        <Typography variant="h5" className={classes.createCardTitle}>
          {t('home.workflow.info')}
        </Typography>
        {isDisabled ? (
          <ArrowDisabled className={classes.arrowForwardIcon} />
        ) : (
          <Arrow className={classes.arrowForwardIcon} />
        )}
      </CardActionArea>
    </Card>
  );
};

export { CreateWorkflowCard };
