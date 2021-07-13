import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import TargetCopy from '../../views/Targets/TargetCopy';
import useStyles from './styles';

const ConnectTarget: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className={classes.root}>
        <BackButton />
        <div className={classes.container}>
          <Typography variant="h3">
            {t('targets.connectHome.connectText')}
          </Typography>
          <Paper className={classes.content}>
            <div className={classes.connectTarget}>
              <div>
                <Typography variant="h5">
                  {t('targets.newTarget.head')}
                </Typography>
                <br />
                <Typography>1. {t('targets.newTarget.head1')}</Typography>
                <Typography>
                  2.{' '}
                  <a
                    href="https://github.com/litmuschaos/litmusctl/blob/master/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('targets.newTarget.head2')}
                  </a>
                </Typography>
                <Typography>3. {t('targets.newTarget.head3')}</Typography>
              </div>
              <img
                className={classes.linkTargetImg}
                src="./icons/connectTarget.svg"
                alt="link target"
              />
            </div>

            <TargetCopy />
          </Paper>
        </div>
      </section>
    </Scaffold>
  );
};
export default ConnectTarget;
