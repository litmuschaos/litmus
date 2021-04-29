import { Paper, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgentDeployModal } from '../../AgentDeployModal';
import useStyles from './styles';

interface AgentInfoContainerProps {
  agentCount: number;
}

const AgentInfoContainer: React.FC<AgentInfoContainerProps> = ({
  agentCount,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

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
          onClick={handleOpen}
          className={classes.infoContainerButton}
        >
          <Typography>
            <ArrowUpwardIcon />
            {t('homeViews.agentConfiguredHome.agentInfoContainer.deploy')}
          </Typography>
        </ButtonOutlined>

        <Modal
          height="50%"
          width="50%"
          open={modalOpen}
          onClose={handleClose}
          modalActions={
            <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
          }
        >
          <AgentDeployModal handleClose={handleClose} />
        </Modal>
      </Paper>
    </div>
  );
};

export { AgentInfoContainer };
