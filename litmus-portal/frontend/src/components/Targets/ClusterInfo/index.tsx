import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';
import ButtonOutline from '../../Button/ButtonOutline';
// import BrowseWorkflow from '../TargetHome/BrowseWorkflow';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';
import TargetCopy from '../TargetCopy';
import { Cluster } from '../../../models/graphql/clusterData';
import { LocationState } from '../../../models/routerModel';

interface ClusterProps {
  data: Cluster;
}
interface ClusterVarsProps {
  location: LocationState<ClusterProps>;
}

const ClusterInfo: React.FC<ClusterVarsProps> = ({ location }) => {
  const { data } = location.state;
  const classes = useStyles();
  const link: string = data?.token;

  const handleClick = () => {
    history.push('/targets');
  };

  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.backBotton}>
          <ButtonOutline isDisabled={false} handleClick={handleClick}>
            <div>Back</div>
          </ButtonOutline>
          <div className={classes.header}>
            <Typography variant="h4">
              {t('workflowCluster.header.formControl.clusterInfo')}
            </Typography>
          </div>
        </div>
      </section>
      <section className="Connect new target">
        <div className={classes.mainDiv}>
          <div className={classes.detailsDiv}>
            {/* name */}
            <div className={classes.firstCol}>
              <div className={classes.status}>
                <div className={classes.checkCluster}>
                  <Typography variant="h6">
                    <strong>Cluster Details</strong>
                  </Typography>
                </div>
                <div>
                  {data.is_active ? (
                    <div className={classes.Signed}>
                      {t('workflowCluster.header.formControl.menu1')}
                    </div>
                  ) : (
                    <div className={classes.NotSigned}>
                      {t('workflowCluster.header.formControl.menu2')}
                    </div>
                  )}
                </div>
              </div>
              <div className={classes.expDiv}>
                <ButtonOutline handleClick={() => {}} isDisabled={false}>
                  <div className={classes.expDiv}>
                    <img
                      src="/icons/bin-red.svg"
                      alt="Delete"
                      className={classes.btnImg}
                    />
                    <Typography className={classes.btnText}>
                      {t('workflowCluster.header.formControl.delete')}
                    </Typography>
                  </div>
                </ButtonOutline>
              </div>
            </div>
            <div>
              <Typography>Version : </Typography>
            </div>
            <div className={classes.version}>
              <Typography>
                <strong>Details : {data.description}</strong>
              </Typography>
            </div>
          </div>
          <div>
            <div className={classes.aboutDiv}>
              <div>
                <Typography variant="h6">
                  <strong>
                    {t('workflowCluster.header.formControl.about')}{' '}
                  </strong>
                </Typography>
              </div>
              <div className={classes.stepsDiv}>
                <Typography className={classes.connectdevice}>
                  {t('targets.newTarget.head')}
                </Typography>
                <Typography>{t('targets.newTarget.head1')}</Typography>
                <Typography>{t('targets.newTarget.head2')}</Typography>
                <Typography>{t('targets.newTarget.head3')}</Typography>
                {/*
              <Typography>
                {t('targets.newTarget.head4')}{' '}
                <strong>{t('targets.newTarget.head5')}</strong>
              </Typography>
              */}
              </div>
              <div className={classes.rightMargin}>
                {link && <TargetCopy yamlLink={link} />}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Scaffold>
  );
};

export default ClusterInfo;
