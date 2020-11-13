import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { history } from '../../../redux/configureStore';
import ButtonOutline from '../../Button/ButtonOutline';
import TargetCopy from '../TargetCopy';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';
import {
  CreateClusterInput,
  CreateClusterInputResponse,
  Cluster,
} from '../../../models/graphql/clusterData';
import { USER_CLUSTER_REG, GET_CLUSTER } from '../../../graphql';
import { RootState } from '../../../redux/reducers';
import Loader from '../../Loader';
import ButtonFilled from '../../Button/ButtonFilled';
import Unimodal from '../../../containers/layouts/Unimodal';
import BackButton from '../../Button/BackButton';

const ConnectTarget = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [link, setLink] = React.useState('');
  const [id, setID] = React.useState('');
  const [modal, setModal] = React.useState(false);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const [createClusterReg] = useMutation<
    CreateClusterInputResponse,
    CreateClusterInput
  >(USER_CLUSTER_REG, {
    onCompleted: (data) => {
      const ID: string = data.userClusterReg.cluster_id;
      const linkYaml: string = data.userClusterReg.token;
      setLink(linkYaml);
      setID(ID);
    },
  });

  const [getCluster] = useLazyQuery(GET_CLUSTER, {
    onCompleted: (data) => {
      if (data && data.getCluster.length !== 0) {
        data.getCluster.forEach((e: Cluster) => {
          if (id === e.cluster_id) {
            if (e.is_cluster_confirmed === true) {
              setOpen(false);
              setModal(true);
            }
          }
        });
      }
    },
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000,
  });

  useEffect(() => {
    const createClusterInput = {
      cluster_name: Math.random().toString(36).substring(7),
      description: 'external agent',
      platform_name: '',
      project_id: selectedProjectID,
      cluster_type: 'external',
      agent_scope: 'cluster',
      agent_namespace: 'litmus',
      serviceaccount: '',
      agent_sa_exists: false,
      agent_ns_exists: false,
    };
    createClusterReg({
      variables: { ClusterInput: createClusterInput },
    });

    getCluster({
      variables: { project_id: selectedProjectID },
    });
  }, []);

  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.backBotton}>
          <BackButton isDisabled={false}>
            <Typography>Back</Typography>
          </BackButton>
          <div className={classes.header}>
            <Typography variant="h4">
              {t('targets.connectHome.connectText')}
            </Typography>
          </div>
        </div>
      </section>
      <section className="Connect new target">
        <div className={classes.mainDiv}>
          <div className={classes.connectTarget}>
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
              <img src="icons/targetsC.svg" alt="down arrow icon" />
            </div>
          </div>
          <div className={classes.rightMargin}>
            {link && <TargetCopy yamlLink={link} />}
          </div>
          {open ? (
            <div className={classes.loader}>
              <div className={classes.loaderMargin}>
                <Loader size={20} />
              </div>
              <div>
                <Typography>{t('targets.newTarget.conformation')}</Typography>
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <div>
        <Unimodal
          open={modal}
          handleClose={() => {
            history.push('/targets');
          }}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          hasCloseBtn
        >
          <div className={classes.body}>
            <img src="icons/finish.svg" className={classes.mark} alt="mark" />
            <Typography className={classes.heading}>
              {t('ConnectTargets.title')}
              <br />
              {t('ConnectTargets.head')}
            </Typography>
            <Typography className={classes.headWorkflow}>
              {t('ConnectTargets.info')} <br />
              {t('ConnectTargets.mainLine')}
            </Typography>
            <div className={classes.buttonModal}>
              <ButtonOutline
                isDisabled={false}
                handleClick={() => {
                  history.push('/targets');
                  setOpen(false);
                }}
              >
                <div>{t('ConnectTargets.button.buttonBack')}</div>
              </ButtonOutline>

              <ButtonFilled
                data-cy="connectTarget"
                isPrimary={false}
                handleClick={() => {
                  history.push('/create-workflow');
                  setOpen(false);
                }}
              >
                <div> {t('ConnectTargets.button.buttonSchedule')}</div>
              </ButtonFilled>
            </div>
          </div>
        </Unimodal>
      </div>
    </Scaffold>
  );
};
export default ConnectTarget;
