import { useMutation, useQuery } from '@apollo/client';
import { Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeveloperGuide from '../../components/DeveloperGuide';
import Loader from '../../components/Loader';
import { constants } from '../../constants';
import Wrapper from '../../containers/layouts/Wrapper';
import { DELETE_HUB, GET_HUB_STATUS, SYNC_REPO } from '../../graphql';
import {
  EditHub,
  HubDetails,
  HubStatus,
  HubType,
} from '../../models/graphql/chaoshub';
import { getProjectID } from '../../utils/getSearchParams';
import CustomMyHubCard from './customMyHubCard';
import useStyles from './styles';

const MyHubConnectDrawer = lazy(() => import('./MyHubConnectDrawer'));

interface DeleteHub {
  deleteHubModal: boolean;
  hubID: string;
  hubName: string;
}

interface CloneResult {
  type: string;
  message: string;
}

const MyHub: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Get selected projectID from the URL
  const projectID = getProjectID();

  const [displayResult, setDisplayResult] = useState<boolean>(false);
  const [cloneResult, setCloneResult] = useState<CloneResult>({
    type: '',
    message: '',
  });

  const [edit, setEdit] = useState<EditHub>({
    isEditing: false,
    hubType: HubType.git,
  });

  // Get MyHubs with Status
  const { data, loading, refetch } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  const [drawerState, setDrawerState] = useState(false);

  /**
   * State Variables for Edit MyHub
   */
  const [hubName, setHubName] = useState(''); // To distinguish between create or edit MyHub

  const openHubDrawer = (myHubName: string, hubType: string) => {
    setHubName(myHubName);
    setEdit({
      isEditing: true,
      hubType,
    });
    setDrawerState(true);
  };

  const handleDrawerClose = () => {
    if (hubName.length && edit.isEditing) {
      setHubName('');
      setEdit({
        ...edit,
        isEditing: false,
      });
    }
    setDrawerState(false);
  };

  const handleDrawerCloseWithRefetch = () => {
    setDrawerState(false);
    if (hubName.length && edit.isEditing) {
      setEdit({
        ...edit,
        isEditing: false,
      });
      setHubName('');
    }
    refetch();
  };

  const handleAlertClose = () => {
    setDisplayResult(false);
  };

  const [key, setKey] = useState('');

  // Mutation to refresh a repo
  const [refreshRepo, { loading: refreshLoading }] = useMutation(SYNC_REPO, {
    refetchQueries: [
      {
        query: GET_HUB_STATUS,
        variables: { projectID },
      },
    ],
    onError: () => {
      refetch();
    },
  });

  // Mutation to delete a repo
  const [deleteRepo] = useMutation(DELETE_HUB, {
    onCompleted: () => {
      refetch();
    },
  });

  const totalHubs = data && data.listHubStatus;

  const [deleteHub, setDeleteHub] = useState<DeleteHub>({
    deleteHubModal: false,
    hubID: '',
    hubName: '',
  });

  const handleHubDelete = () => {
    deleteRepo({
      variables: {
        hubID: deleteHub.hubID,
        projectID,
      },
    });
    setDeleteHub({
      deleteHubModal: false,
      hubID: '',
      hubName: '',
    });
  };

  const handleDelete = (hubId: string, hubName: string) => {
    setDeleteHub({
      deleteHubModal: true,
      hubID: hubId,
      hubName,
    });
  };

  const handleClose = () => {
    setDeleteHub({
      deleteHubModal: false,
      hubID: '',
      hubName: '',
    });
  };

  const handleRefresh = (hubId: string) => {
    setKey(hubId);
    refreshRepo({
      variables: {
        id: hubId,
        projectID,
      },
    });
  };

  return (
    <Wrapper>
      {loading ? (
        <Loader />
      ) : (
        <div className={classes.root}>
          {/* Header Div */}
          <div className={classes.header}>
            <Typography variant="h3">{t('myhub.mainPage.header')}</Typography>
            <ButtonFilled
              onClick={() => setDrawerState(true)}
              className={classes.connectNewHub}
              data-cy="myHubConnectButton"
            >
              {t('myhub.mainPage.connect')}
            </ButtonFilled>
          </div>
          {/* Charts Div */}
          <div className={classes.mainDiv}>
            <Typography className={classes.connectHub}>
              {t('myhub.mainPage.switchHub')}
            </Typography>
            <div className={classes.noHub}>
              {totalHubs && totalHubs.length === 0 ? (
                <DeveloperGuide
                  header={t('myhub.mainPage.devGuideHeader')}
                  description={t('myhub.mainPage.devGuideDescription')}
                  expAvailable={false}
                />
              ) : (
                <></>
              )}
              <div className={classes.chartsGroup}>
                {totalHubs &&
                  totalHubs.map((hub: HubDetails) => (
                    <CustomMyHubCard
                      key={hub.id}
                      hub={hub}
                      keyValue={key}
                      handleDelete={handleDelete}
                      handleRefresh={handleRefresh}
                      refreshLoader={refreshLoading}
                      handleEditHub={openHubDrawer}
                    />
                  ))}
              </div>
            </div>
            {deleteHub.deleteHubModal ? (
              <Modal
                open={deleteHub.deleteHubModal}
                onClose={handleClose}
                modalActions={
                  <ButtonOutlined onClick={handleClose}>
                    &#x2715;
                  </ButtonOutlined>
                }
                data-cy="deleteHubModal"
                width="50%"
                height="fit-content"
              >
                <div className={classes.modalDiv}>
                  <img src="./icons/red-cross.svg" alt="disconnect" />
                  <Typography className={classes.disconnectHeader}>
                    {t('myhub.mainPage.disconnectHeader')}{' '}
                    <strong>{deleteHub.hubName}</strong>?
                  </Typography>
                  <div className={classes.disconnectBtns}>
                    <ButtonOutlined onClick={handleClose}>
                      {t('myhub.mainPage.cancel')}
                    </ButtonOutlined>
                    <ButtonFilled variant="error" onClick={handleHubDelete}>
                      {t('myhub.mainPage.deleteHub')}
                    </ButtonFilled>
                  </div>
                </div>
              </Modal>
            ) : null}
          </div>
        </div>
      )}

      {/* Add/Edit MyHub Drawer */}
      <MyHubConnectDrawer
        hubName={hubName}
        editHub={edit}
        drawerState={drawerState}
        handleDrawerClose={handleDrawerClose}
        refetchQuery={handleDrawerCloseWithRefetch}
        setAlertState={(alert) => setDisplayResult(alert)}
        setAlertResult={(alertResult) => setCloneResult(alertResult)}
      />
      {/* SnackBar to display success/failure alerts */}
      <Snackbar
        data-cy="myHubAlert"
        open={displayResult}
        autoHideDuration={6000}
        onClose={() => {
          if (cloneResult.type === constants.error) {
            setDisplayResult(false);
          } else {
            handleAlertClose();
          }
        }}
      >
        <Alert
          onClose={() => {
            if (cloneResult.type === constants.error) {
              setDisplayResult(false);
            } else {
              handleAlertClose();
            }
          }}
          severity={cloneResult.type === constants.error ? 'error' : 'success'}
        >
          {cloneResult.message}
        </Alert>
      </Snackbar>
    </Wrapper>
  );
};

export default MyHub;
