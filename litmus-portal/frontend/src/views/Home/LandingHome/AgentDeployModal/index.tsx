import { Typography } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useState } from 'react';
import useStyles from './styles';

interface AgentDeployModalProps {
  handleClose: () => void;
}

const AgentDeployModal: React.FC<AgentDeployModalProps> = ({ handleClose }) => {
  const classes = useStyles();

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
        <img src="./icons/agentDeployModal.svg" alt="Target Connect" />
        <Typography>Connect a target</Typography>
      </div>
      <div className={classes.instructionSection}>
        <Typography>1. Open the cluster console</Typography>
        <Typography>
          2. Download
          <a
            href="https://github.com/litmuschaos/litmusctl"
            target="_blank"
            rel="noreferrer noopener"
          >
            litmusctl
          </a>
        </Typography>
        <Typography>
          3. Paste and run the following command into the cluster console
        </Typography>
      </div>
      <div className={classes.copyCommandSection}>
        <div className={classes.commandRect}>
          <Typography>$ litmusctl agent register</Typography>
        </div>
        <ButtonOutlined
          className={classes.copyButton}
          onClick={() => copyTextToClipboard(`litmusctl agent register`)}
        >
          {copying ? (
            <DoneIcon />
          ) : (
            <>
              <img src="./icons/copy.svg" alt="copy" />
              <Typography>Copy</Typography>
            </>
          )}
        </ButtonOutlined>
      </div>
      <div className={classes.doneButton}>
        <ButtonFilled onClick={handleClose}>
          <Typography>Done</Typography>
        </ButtonFilled>
      </div>
    </div>
  );
};

export { AgentDeployModal };
