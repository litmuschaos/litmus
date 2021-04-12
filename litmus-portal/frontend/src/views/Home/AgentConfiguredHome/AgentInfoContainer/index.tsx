import { Paper, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonOutlined } from 'litmus-ui';
import React from 'react';
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
  // const { t } = useTranslation();

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
                <Typography>Agent</Typography>
              ) : (
                <Typography>Agents</Typography>
              )}
            </div>
            <div>
              <Typography id="agentDesc">
                Cloud native chaos engineering can be setup on this cluster
                using Litmus Chaos
              </Typography>
            </div>
          </div>
        </div>
        {projectRole === 'Owner' && (
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
              Deploy new Agent
            </Typography>
          </ButtonOutlined>
        )}
      </Paper>
    </div>
  );
};

export { AgentInfoContainer };
