import { Typography } from '@material-ui/core';
import Done from '@material-ui/icons/DoneAllTwoTone';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonOutline from '../../Button/ButtonOutline';
import useStyles from './styles';

interface InstallProps {
  yamlLink: string;
}

const TargetCopy: React.FC<InstallProps> = ({ yamlLink }) => {
  const classes = useStyles();
  const [copying, setCopying] = useState(false);

  function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      console.error('Oops Could not copy text: ');
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));

    setTimeout(() => setCopying(false), 6000);
  }

  const x = window.location.hostname;
  const y = window.location.port;

  const engineUrl: string = `kubectl apply -f http://${x}:${y}/api/file/${yamlLink}.yaml`;

  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      {copying ? (
        <Typography className={classes.copiedDiv}>
          {t('targets.copy.copying')}
        </Typography>
      ) : null}
      <div className={classes.linkBox}>
        <Typography className={classes.yamlLink}>{engineUrl}</Typography>
        <div className={classes.buttonBox}>
          <ButtonOutline
            isDisabled={false}
            handleClick={() => copyTextToClipboard(engineUrl)}
          >
            {!copying ? (
              <div className={classes.copyText}>
                <img
                  src="/icons/copy.svg"
                  style={{ paddingRight: 10 }}
                  alt="copy"
                />
                <Typography>{t('targets.copy.copy')}</Typography>
              </div>
            ) : (
              <>
                <div className={classes.copyText}>
                  <Done className={classes.done} />
                  <Typography>{t('targets.copy.copied')}</Typography>
                </div>
              </>
            )}
          </ButtonOutline>
        </div>
      </div>
    </div>
  );
};

export default TargetCopy;
