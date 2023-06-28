import { Typography, useTheme } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { ButtonFilled, ButtonOutlined, Icon } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface AgentDeployModalProps {
  handleClose: () => void;
}

const AgentDeployModal: React.FC<AgentDeployModalProps> = ({ handleClose }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  const [copying, setCopying] = useState<boolean>(false);

  function fallbackCopyTextToClipboard(text: string) {
    // eslint-disable-next-line no-alert
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  }

  function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));

    setTimeout(() => setCopying(false), 3000);
  }

  return (
    <div className={classes.modalContainer}>
      <div className={classes.heading}>
        <div className={classes.iconWrapper}>
          <Icon
            name="clusters"
            size="lg"
            color={theme.palette.background.paper}
          />
        </div>
        <Typography className={classes.space}>
          {t('homeViews.landingHome.agentDeployModal.heading')}
        </Typography>
      </div>
      <div className={classes.instructionSection}>
        <Typography>
          {t('homeViews.landingHome.agentDeployModal.firstStep')}
        </Typography>
        <Typography>
          {t('homeViews.landingHome.agentDeployModal.secondStep')}
          <a
            href="https://github.com/litmuschaos/litmusctl"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('homeViews.landingHome.agentDeployModal.litmusctl')}
          </a>
        </Typography>
        <Typography>
          {t('homeViews.landingHome.agentDeployModal.thirdStep')}
        </Typography>
      </div>
      <div className={classes.copyCommandSection}>
        <div className={classes.commandRect}>
          <Typography>
            {t('homeViews.landingHome.agentDeployModal.agentRegister')}
          </Typography>
        </div>
        <ButtonOutlined
          className={classes.copyButton}
          onClick={() =>
            copyTextToClipboard(`litmusctl connect chaos-delegate`)
          }
        >
          {copying ? (
            <DoneIcon />
          ) : (
            <>
              <Icon name="copy" size="lg" color={theme.palette.primary.main} />
              <Typography className={classes.space}>
                {t('homeViews.landingHome.agentDeployModal.copy')}
              </Typography>
            </>
          )}
        </ButtonOutlined>
      </div>
      <div className={classes.doneButton}>
        <ButtonFilled onClick={handleClose}>
          <Typography>
            {t('homeViews.landingHome.agentDeployModal.done')}
          </Typography>
        </ButtonFilled>
      </div>
    </div>
  );
};

export default AgentDeployModal;
