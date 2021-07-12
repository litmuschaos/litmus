import { Typography } from '@material-ui/core';
import Done from '@material-ui/icons/DoneAllTwoTone';
import { ButtonOutlined } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

const TargetCopy: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [copying, setCopying] = useState(false);

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

  const command = 'litmusctl agent connect';

  return (
    <div className={classes.root}>
      {copying && (
        <Typography className={classes.copiedDiv}>
          {t('targets.copy.copying')}
        </Typography>
      )}
      <div className={classes.commandContainer}>
        <Typography className={classes.command}>$ {command}</Typography>
        <ButtonOutlined
          startIcon={
            !copying ? (
              <img
                className={classes.copyIcon}
                src="./icons/copy.svg"
                alt="copy"
              />
            ) : (
              <Done className={classes.copyIcon} />
            )
          }
          onClick={() => copyTextToClipboard(command)}
        >
          {copying ? (
            <Typography>{t('targets.copy.copied')}</Typography>
          ) : (
            <Typography>{t('targets.copy.copy')}</Typography>
          )}
        </ButtonOutlined>
      </div>
    </div>
  );
};

export default TargetCopy;
