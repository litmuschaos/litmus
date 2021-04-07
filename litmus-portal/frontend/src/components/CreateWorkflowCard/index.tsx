import { Card, CardActionArea, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Arrow } from '../../svg/arrow.svg';
import { ReactComponent as ArrowDisabled } from '../../svg/arrow_disabled.svg';
import useStyles from './styles';

interface CreateWorkflowCardProps {
  isDisabled: boolean;
}

const CreateWorkflowCard: React.FC<CreateWorkflowCardProps> = ({
  isDisabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles({ isDisabled });

  return (
    <Card className={classes.createCard} data-cy="createWorkflow">
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
