import { Paper, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface AgentInfoContainerProps {
  agentCount: number;
}

const AgentInfoContainer: React.FC<AgentInfoContainerProps> = ({
  agentCount,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  return (
    <div>
      {/* Agent info container */}
      <Paper className={classes.agentInfoContainer}>
        <div className={classes.agentInfoBlock}>
          <div className={classes.agentInfoData}>
            <div>
              <Typography id="agentCount">{agentCount}</Typography>
              {agentCount === 1 ? (
                <Typography>
                  {t('homeViews.agentConfiguredHome.agentInfoContainer.agent')}
                </Typography>
              ) : (
                <Typography>
                  {t('homeViews.agentConfiguredHome.agentInfoContainer.agents')}
                </Typography>
              )}
            </div>
            <div>
              <Typography id="agentDesc">
                {t(
                  'homeViews.agentConfiguredHome.agentInfoContainer.description'
                )}
              </Typography>
            </div>
          </div>
        </div>
        <ButtonOutlined
          onClick={() => {
            history.push({
              pathname: '/targets',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
          className={classes.infoContainerButton}
        >
          <Typography>
            <ArrowUpwardIcon />
            {t('homeViews.agentConfiguredHome.agentInfoContainer.deploy')}
          </Typography>
        </ButtonOutlined>
      </Paper>
    </div>
  );
};

export { AgentInfoContainer };
