import { Typography } from '@material-ui/core';
import Done from '@material-ui/icons/DoneAllTwoTone';
import React, { useState } from 'react';
import useStyles from './styles';
import ButtonOutline from '../Button/ButtonOutline';

interface InstallProps {
  title: string;
  description: string;
  yamlLink: string;
}

const InstallChaos: React.FC<InstallProps> = ({
  title,
  description,
  yamlLink,
}) => {
  const classes = useStyles();
  const [copying, setCopying] = useState(false);
  const yaml = `kubectl apply -f ${yamlLink}`;

  function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      console.error('Oops Could not copy text: ');
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));

    setTimeout(() => setCopying(false), 3000);
  }

  return (
    <div className={classes.root}>
      <div className={classes.title}>{title}</div>
      <div className={classes.description}>{description}</div>
      <div className={classes.linkBox}>
        <Typography variant="subtitle1" className={classes.yamlLink}>
          kubectl apply -f {yamlLink}
        </Typography>

        <div className={classes.buttonBox}>
          <ButtonOutline
            isDisabled={false}
            handleClick={() => copyTextToClipboard(yaml)}
          >
            {!copying ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <img
                  src="/icons/copy.svg"
                  style={{ paddingRight: 10 }}
                  alt="copy"
                />
                <Typography>Copy</Typography>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Done className={classes.done} />
                <Typography>Copied</Typography>
              </div>
            )}
          </ButtonOutline>
        </div>
      </div>
    </div>
  );
};
export default InstallChaos;
