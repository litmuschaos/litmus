import { Drawer, Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/Button/BackButton';
import { EditHub, HubType } from '../../../models/graphql/chaoshub';
import ConnectGit from './connectGit';
import ConnectRemote from './connectRemote';
import useStyles from './styles';

interface CloneResult {
  type: string;
  message: string;
}

interface MyHubConnectDrawerProps {
  hubName?: string;
  editHub: EditHub;
  drawerState: boolean;
  handleDrawerClose: () => void;
  refetchQuery: () => void;
  setAlertState: (alertState: boolean) => void;
  setAlertResult: (alertResult: CloneResult) => void;
}

const MyHubConnectDrawer: React.FC<MyHubConnectDrawerProps> = ({
  hubName,
  editHub,
  drawerState,
  handleDrawerClose,
  refetchQuery,
  setAlertState,
  setAlertResult,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [hubType, setHubType] = useState<HubType>(HubType.none);

  useEffect(() => {
    if (editHub.isEditing) {
      setHubType(editHub.hubType as HubType);
    }
  }, [editHub]);

  const resetDrawer = () => {
    setHubType(HubType.none);
    refetchQuery();
  };
  return (
    <Drawer
      className={classes.drawer}
      anchor="right"
      open={drawerState}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <>
        <div className={classes.header}>
          <div>
            {/* Back Button */}
            <BackButton
              onClick={() => {
                if (editHub.isEditing) {
                  setHubType(HubType.none);
                  handleDrawerClose();
                } else if (
                  hubType === HubType.git ||
                  hubType === HubType.remote
                ) {
                  setHubType(HubType.none);
                } else {
                  setHubType(HubType.none);
                  handleDrawerClose();
                }
              }}
            />
          </div>
          <Typography variant="h4" className={classes.topMargin}>
            {hubName?.length
              ? t('myhub.connectHubPage.editHub')
              : t('myhub.connectHubPage.connectHub')}
          </Typography>
        </div>
        <div className={classes.detailsDiv}>
          {hubType.toLowerCase() === HubType.none.toLowerCase() ? (
            // Select MyHub type
            <div>
              <ButtonOutlined
                className={classes.connectHubBtn}
                onClick={() => {
                  setHubType(HubType.git);
                }}
              >
                <div
                  className={classes.connectHubIconDiv}
                  data-cy="connectFromGithubButton"
                >
                  <img
                    src="./icons/gitops-image.svg"
                    alt="Gitops"
                    className={classes.gitopsIcon}
                  />
                  <Typography className={classes.connectHubText}>
                    Connect a new Git repository
                  </Typography>
                </div>
              </ButtonOutlined>
              <div style={{ margin: 10 }} />

              <ButtonOutlined
                className={classes.connectHubBtn}
                onClick={() => {
                  setHubType(HubType.remote);
                }}
              >
                <div
                  className={classes.connectHubIconDiv}
                  data-cy="connectFromRemoteButton"
                >
                  <img
                    src="./icons/remote-git.svg"
                    alt="Download"
                    className={classes.gitopsIcon}
                  />
                  <Typography className={classes.connectHubText}>
                    Connect a remote ChaosHub
                  </Typography>
                </div>
              </ButtonOutlined>
            </div>
          ) : hubType.toLowerCase() === HubType.git.toLowerCase() ? (
            // Hub type Git configuration
            <ConnectGit
              alertState={(val) => {
                setAlertState(val);
              }}
              alertMessage={(type, message) => {
                setAlertResult({
                  type,
                  message,
                });
              }}
              refetchQuery={resetDrawer}
              editHub={editHub}
              hubName={hubName}
            />
          ) : hubType.toLowerCase() === HubType.remote.toLowerCase() ? (
            // Hub type remote configuration
            <ConnectRemote
              alertState={(val) => {
                setAlertState(val);
              }}
              alertMessage={(type, message) => {
                setAlertResult({
                  type,
                  message,
                });
              }}
              refetchQuery={resetDrawer}
              editHub={editHub}
              hubName={hubName}
            />
          ) : (
            <></>
          )}
        </div>
      </>
    </Drawer>
  );
};

export default MyHubConnectDrawer;
