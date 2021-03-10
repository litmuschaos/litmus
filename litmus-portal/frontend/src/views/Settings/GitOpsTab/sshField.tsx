import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Done } from '@material-ui/icons';
import { ButtonOutlined } from 'litmus-ui';
import Loader from '../../../components/Loader';
import useStyles from './styles';

interface SSHFieldProps {
  sshLoading: boolean;
  copying: boolean;
  publicKey: string;
  copyPublicKey: (text: string) => void;
}

const SSHField: React.FC<SSHFieldProps> = ({
  sshLoading,
  copying,
  publicKey,
  copyPublicKey,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.sshDiv}>
      <Typography className={classes.alertText}>
        {t('myhub.connectHubPage.sshText')}
      </Typography>
      <div className={classes.sshDataDiv}>
        {sshLoading ? (
          <Loader />
        ) : (
          <>
            <Typography className={classes.sshText}>{publicKey}</Typography>
            <div className={classes.copyBtn}>
              <ButtonOutlined
                disabled={false}
                onClick={() => copyPublicKey(publicKey)}
              >
                {!copying ? (
                  <div className={classes.rowDiv}>
                    <img
                      src="./icons/copy.svg"
                      className={classes.copyBtnImg}
                      alt="copy"
                    />
                    <Typography>{t('myhub.installChaos.copy')}</Typography>
                  </div>
                ) : (
                  <div className={classes.rowDiv}>
                    <Done className={classes.done} />
                    <Typography>{t('myhub.installChaos.copied')}</Typography>
                  </div>
                )}
              </ButtonOutlined>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default SSHField;
