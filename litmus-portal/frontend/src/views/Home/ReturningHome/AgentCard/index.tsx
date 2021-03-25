import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../../../../models/graphql/user';
import useStyles from './styles';

const AgentCard: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <div className={classes.agentFlex}>
        <div className={classes.agentCountDiv}>
          <Typography className={classes.agentCount}>{0}</Typography>
          <Typography className={classes.agentText}>
            {t('home.NonAdmin.agents')}
          </Typography>
        </div>

        <div className={classes.agentDesc}>
          <Typography>{t('home.NonAdmin.chaosAgentInfo')}</Typography>
        </div>
      </div>
      <ButtonFilled className={classes.deployButton} onClick={() => {}}>
        {t('home.NonAdmin.deployFirst')}
      </ButtonFilled>
    </Paper>
  );
};

export default AgentCard;
