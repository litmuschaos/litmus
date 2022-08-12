import { useMutation, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import {
  ADD_REMOTE_MY_HUB,
  GET_HUB_STATUS,
  UPDATE_MY_HUB,
} from '../../../graphql';
import {
  CreateMyHub,
  CreateRemoteMyHub,
  EditHub,
  GitHub,
  HubStatus,
  HubType,
  AuthType,
  MyHubData,
} from '../../../models/graphql/chaoshub';
import { getProjectID } from '../../../utils/getSearchParams';
import { validateStartEmptySpacing } from '../../../utils/validate';
import useStyles from './styles';

interface ConnectRemoteProp {
  alertState: (alert: boolean) => void;
  alertMessage: (type: string, message: string) => void;
  refetchQuery: () => void;
  editHub: EditHub;
  hubName?: string;
}

const ConnectRemote: React.FC<ConnectRemoteProp> = ({
  alertState,
  alertMessage,
  refetchQuery,
  editHub,
  hubName,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [remoteHub, setRemoteHub] = useState<GitHub>({
    HubName: '',
    GitURL: '',
    GitBranch: '',
    RemoteURL: '',
  });
  const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { projectID: getProjectID() },
    fetchPolicy: 'network-only',
  });
  const hubData = data?.listHubStatus.filter(
    (hubs) => hubs.hubName === hubName
  )[0];
  const [editHubLoader, setEditHubLoader] = useState(!!editHub.isEditing);

  /**
   * addRemoteChaosHub mutation to create a new hub
   */
  const [addRemoteMyHub, { loading }] = useMutation<
    MyHubData,
    CreateRemoteMyHub
  >(ADD_REMOTE_MY_HUB, {
    onCompleted: () => {
      alertState(true);
      alertMessage(constants.success, 'ChaosHub is successfully connected');
      refetchQuery();
    },
    onError: (error) => {
      alertState(true);
      alertMessage(constants.error, `${error.message}. `);
      refetchQuery();
    },
  });

  /**
   * updateChaosHub mutation to edit the chaoshub configuration
   */
  const [updateMyHub, { loading: updateHubLoader }] = useMutation<
    MyHubData,
    CreateMyHub
  >(UPDATE_MY_HUB, {
    onCompleted: () => {
      alertState(true);
      alertMessage(
        constants.success,
        'My Hub configurations successfully updated'
      );
      refetchQuery();
    },
    onError: (error) => {
      alertState(true);
      alertMessage(constants.error, `${error.message}`);
      refetchQuery();
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /**
     * If hubName is present, edit myhub mutation will be called
     */
    if (editHub.isEditing && hubData?.hubType === HubType.remote) {
      updateMyHub({
        variables: {
          request: {
            id: hubData?.id,
            hubName: remoteHub.HubName.trim(),
            repoURL: remoteHub.RemoteURL ?? '',
            repoBranch: '',
            isPrivate: false,
            authType: AuthType.NONE,
            projectID: getProjectID(),
          },
        },
      });
    } else
    /**
     * This will call the addRemoteChaosHub mutation
     */
      addRemoteMyHub({
        variables: {
          request: {
            hubName: remoteHub.HubName.trim(),
            repoURL: remoteHub.RemoteURL ?? '',
            projectID: getProjectID(),
          },
        },
      });
  };

  useEffect(() => {
    /**
     * If hubName is present, this fetches the myhub configuration
     * and sets in the inputfields (for edit Myhub)
     */
    if (editHub.isEditing && hubData !== undefined) {
      setRemoteHub({
        HubName: hubData.hubName,
        GitURL: '',
        GitBranch: '',
        RemoteURL: hubData.repoURL,
      });
      setEditHubLoader(false);
    }
  }, [editHub, hubData]);

  return (
    <div>
      {editHubLoader ? (
        <Loader size={40} />
      ) : (
        <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
          <Typography className={classes.warningText}>
            Warning: Remote Zip name and ChaosHub name should be same.
          </Typography>
          <div className={classes.inputDivRemote}>
            <InputField
              className={classes.hubName}
              data-cy="hubName"
              label="Hub Name"
              value={remoteHub.HubName}
              helperText={
                validateStartEmptySpacing(remoteHub.HubName)
                  ? t('myhub.validationEmptySpace')
                  : ''
              }
              variant={
                validateStartEmptySpacing(remoteHub.HubName)
                  ? 'error'
                  : 'primary'
              }
              required
              onChange={(e) =>
                setRemoteHub({
                  ...remoteHub,
                  HubName: e.target.value,
                })
              }
            />
            <div style={{ margin: 10 }} />
            <InputField
              className={classes.hubName}
              data-cy="hubURL"
              label="Hub URL"
              value={remoteHub.RemoteURL}
              helperText={
                validateStartEmptySpacing(remoteHub.RemoteURL ?? '')
                  ? t('myhub.validationEmptySpace')
                  : ''
              }
              variant={
                validateStartEmptySpacing(remoteHub.RemoteURL ?? '')
                  ? 'error'
                  : 'primary'
              }
              required
              onChange={(e) =>
                setRemoteHub({
                  ...remoteHub,
                  RemoteURL: e.target.value,
                })
              }
            />
            <div className={classes.btnDivRemote}>
              <ButtonOutlined
                data-cy="cancel"
                onClick={refetchQuery}
                className={classes.cancelBtn}
              >
                {t('myhub.connectHubPage.cancel')}
              </ButtonOutlined>
              <ButtonFilled
                style={{ width: 140 }}
                data-cy="MyHubSubmit"
                type="submit"
                disabled={
                  validateStartEmptySpacing(remoteHub.RemoteURL ?? '') ||
                  loading ||
                  updateHubLoader
                }
              >
                {loading ? (
                  <Loader size={20} />
                ) : (
                  t('myhub.connectHubPage.submitBtn')
                )}
              </ButtonFilled>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ConnectRemote;
