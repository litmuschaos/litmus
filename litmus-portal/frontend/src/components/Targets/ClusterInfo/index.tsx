import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { history } from '../../../redux/configureStore';
import ButtonOutline from '../../Button/ButtonOutline';
// import BrowseWorkflow from '../TargetHome/BrowseWorkflow';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';
import TargetCopy from '../TargetCopy';
import { Cluster, DeleteCluster } from '../../../models/graphql/clusterData';
import { LocationState } from '../../../models/routerModel';
import { DELETE_CLUSTER } from '../../../graphql';
import Unimodal from '../../../containers/layouts/Unimodal';
import ButtonFilled from '../../Button/ButtonFilled';
import BackButton from '../../Button/BackButton';
import { RootState } from '../../../redux/reducers';

interface ClusterProps {
  data: Cluster;
}
interface ClusterVarsProps {
  location: LocationState<ClusterProps>;
}

const ClusterInfo: React.FC<ClusterVarsProps> = ({ location }) => {
  const { data } = location.state;
  const classes = useStyles();
  const link: string = data.token;

  const [deleteCluster] = useMutation<DeleteCluster>(DELETE_CLUSTER);
  const [open, setOpen] = React.useState(false);

  const handleDelete = () => {
    deleteCluster({ variables: { cluster_id: data.cluster_id } });
    history.push('/targets');
  };

  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.backBotton}>
          <BackButton isDisabled={false}>
            <div>{t('workflowCluster.header.formControl.back')}</div>
          </BackButton>
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
              <div className={classes.linkBox}>
                <div className={classes.status}>
                  <div>
                    <Typography variant="h6">
                      <strong>{t('targets.newTarget.clusterDetails')}</strong>
                    </Typography>
                  </div>
                  <div>
                    {data.is_active ? (
                      <Typography
                        className={`${classes.check} ${classes.active}`}
                      >
                        {t('workflowCluster.header.formControl.menu1')}
                      </Typography>
                    ) : data.is_cluster_confirmed === false ? (
                      <Typography
                        className={`${classes.check} ${classes.pending}`}
                      >
                        {t('workflowCluster.header.formControl.menu6')}
                      </Typography>
                    ) : (
                      <Typography
                        className={`${classes.check} ${classes.notactive}`}
                      >
                        {t('workflowCluster.header.formControl.menu2')}
                      </Typography>
                    )}
                  </div>
                </div>
                <div className={classes.buttonBox}>
                  <ButtonOutline
                    isDisabled={userRole === 'Viewer'}
                    handleClick={() => {
                      setOpen(true);
                    }}
                  >
                    <div className={classes.status}>
                      <img src="/icons/bin-red.svg" alt="Delete" />
                      <div> {t('targets.modalDelete.delete')} </div>
                    </div>
                  </ButtonOutline>
                </div>
              </div>
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
              </div>
              <div className={classes.rightMargin}>
                {link && <TargetCopy yamlLink={link} />}
              </div>
            </div>
          </div>
          <div>
            {open ? (
              <div>
                <Unimodal
                  open={open}
                  handleClose={() => {
                    setOpen(false);
                  }}
                  hasCloseBtn
                >
                  <div className={classes.body}>
                    <img src="/icons/bin-red-delete.svg" alt="Delete" />
                    <div className={classes.text}>
                      <Typography className={classes.typo} align="center">
                        {t('targets.modalDelete.head1')} <br />
                        <strong> {t('targets.modalDelete.head2')}</strong>
                      </Typography>
                    </div>
                    <div className={classes.textSecond}>
                      <Typography className={classes.typoSub} align="center">
                        {t('targets.modalDelete.head3')}
                      </Typography>
                    </div>
                    <div className={classes.buttonGroup}>
                      <ButtonOutline
                        isDisabled={false}
                        handleClick={() => {
                          setOpen(false);
                        }}
                      >
                        <> {t('targets.modalDelete.no')}</>
                      </ButtonOutline>

                      <ButtonFilled
                        isDisabled={false}
                        isPrimary
                        handleClick={handleDelete}
                      >
                        <>{t('targets.modalDelete.yes')}</>
                      </ButtonFilled>
                    </div>
                  </div>
                </Unimodal>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Scaffold>
  );
};

export default ClusterInfo;
