import { useMutation, useQuery } from '@apollo/client';
import {
  Drawer,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Done from '@material-ui/icons/DoneAllTwoTone';
import { ButtonFilled, ButtonOutlined, InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/Button/BackButton';
import GithubInputFields from '../../../components/GitHubComponents/GithubInputFields/GithubInputFields';
import GitHubToggleButton from '../../../components/GitHubComponents/GitHubToggleButtons/GitHubToggleButton';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import {
  ADD_MY_HUB,
  GENERATE_SSH,
  SAVE_MY_HUB,
  UPDATE_MY_HUB,
} from '../../../graphql/mutations';
import { GET_HUB_STATUS } from '../../../graphql/queries';
import {
  CreateMyHub,
  MyHubData,
  MyHubType,
  SSHKey,
  SSHKeys,
} from '../../../models/graphql/user';
import { HubStatus } from '../../../models/redux/myhub';
import { getProjectID } from '../../../utils/getSearchParams';
import {
  isValidWebUrl,
  validateStartEmptySpacing,
} from '../../../utils/validate';
import useStyles from './styles';

interface GitHub {
  HubName: string;
  GitURL: string;
  GitBranch: string;
}

interface MyHubToggleProps {
  isPublicToggled: boolean;
  isPrivateToggled: boolean;
}

interface CloneResult {
  type: string;
  message: string;
}

interface MyHubConnectDrawerProps {
  hubName?: string;
  drawerState: boolean;
  handleDrawerClose: () => void;
  refetchQuery: () => void;
  setAlertState: (alertState: boolean) => void;
  setAlertResult: (alertResult: CloneResult) => void;
}

const MyHubConnectDrawer: React.FC<MyHubConnectDrawerProps> = ({
  hubName,
  drawerState,
  handleDrawerClose,
  refetchQuery,
  setAlertState,
  setAlertResult,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const [gitHub, setGitHub] = useState<GitHub>({
    HubName: '',
    GitURL: '',
    GitBranch: '',
  });
  const [isToggled, setIsToggled] = React.useState<MyHubToggleProps>({
    isPublicToggled: true,
    isPrivateToggled: false,
  });
  const [privateHub, setPrivateHub] = useState('token');
  const [accessToken, setAccessToken] = useState('');
  const [sshKey, setSshKey] = useState<SSHKey>({
    privateKey: '',
    publicKey: '',
  });

  const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: projectID },
    fetchPolicy: 'network-only',
  });
  const hubData = data?.getHubStatus.filter(
    (hubs) => hubs.HubName === hubName
  )[0];

  const [saveChanges, setSaveChanges] = useState(false);

  /**
   * Add MyHub mutation to create a new hub
   */
  const [addMyHub, { loading }] = useMutation<MyHubData, CreateMyHub>(
    ADD_MY_HUB,
    {
      onCompleted: () => {
        setAlertState(true);
        setAlertResult({
          type: constants.success,
          message: 'My Hub was successfully created',
        });
        refetchQuery();
      },
      onError: (error) => {
        setAlertState(true);
        setAlertResult({
          type: constants.error,
          message: `Error: ${error.message}. 
                    You can still save the Hub configuration.`,
        });
        setSaveChanges(true);
      },
    }
  );

  /**
   * Save My Hub mutation to save a hub details for later
   */
  const [saveMyHub] = useMutation<MyHubData, CreateMyHub>(SAVE_MY_HUB, {
    onCompleted: () => {
      setAlertState(true);
      setAlertResult({
        type: constants.success,
        message: 'My Hub was successfully saved',
      });
      setSaveChanges(false);
      refetchQuery();
    },
    onError: () => {
      setAlertState(true);
      setAlertResult({
        type: constants.error,
        message: 'Error while adding My Hub',
      });
    },
  });

  /**
   * Update MyHub mutation to edit the myhub configuration
   */
  const [updateMyHub, { loading: updateHubLoader }] = useMutation<
    MyHubData,
    CreateMyHub
  >(UPDATE_MY_HUB, {
    onCompleted: () => {
      setAlertState(true);
      setAlertResult({
        type: constants.success,
        message: 'My Hub configurations successfully updated',
      });
      refetchQuery();
    },
    onError: (error) => {
      setAlertState(true);
      setAlertResult({
        type: constants.error,
        message: `Error:${error.message}`,
      });
    },
  });

  /**
   * Mutation to generate SSH key
   */
  const [generateSSHKey, { loading: sshLoading }] = useMutation<SSHKeys>(
    GENERATE_SSH,
    {
      onCompleted: (data) => {
        setSshKey({
          privateKey: data.generaterSSHKey.privateKey,
          publicKey: data.generaterSSHKey.publicKey,
        });
      },
    }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /**
     * If hubName is present, edit myhub mutation will be called
     */
    if (hubName?.length) {
      updateMyHub({
        variables: {
          MyHubDetails: {
            id: hubData?.id,
            HubName: gitHub.HubName.trim(),
            RepoURL: gitHub.GitURL,
            RepoBranch: gitHub.GitBranch,
            IsPrivate: isToggled.isPublicToggled
              ? false
              : !!isToggled.isPrivateToggled,
            AuthType: isToggled.isPublicToggled
              ? MyHubType.basic
              : privateHub === 'token'
              ? MyHubType.token
              : privateHub === 'ssh'
              ? MyHubType.ssh
              : MyHubType.basic,
            Token: accessToken,
            UserName: 'user',
            Password: 'user',
            SSHPrivateKey: sshKey.privateKey,
            SSHPublicKey: sshKey.publicKey,
          },
          projectID,
        },
      });
    } else if (saveChanges) {
      /**
       * Save changes is enabled if add myhub mutation fails.
       * This will call the save myhub mutation
       */
      saveMyHub({
        variables: {
          MyHubDetails: {
            HubName: gitHub.HubName.trim(),
            RepoURL: gitHub.GitURL,
            RepoBranch: gitHub.GitBranch,
            IsPrivate: isToggled.isPublicToggled
              ? false
              : !!isToggled.isPrivateToggled,
            AuthType: isToggled.isPublicToggled
              ? MyHubType.basic
              : privateHub === 'token'
              ? MyHubType.token
              : privateHub === 'ssh'
              ? MyHubType.ssh
              : MyHubType.basic,
            Token: accessToken,
            UserName: 'user',
            Password: 'user',
            SSHPrivateKey: sshKey.privateKey,
            SSHPublicKey: sshKey.publicKey,
          },
          projectID,
        },
      });
    } else
    /**
     * This will call the add myhub mutation
     */
      addMyHub({
        variables: {
          MyHubDetails: {
            HubName: gitHub.HubName.trim(),
            RepoURL: gitHub.GitURL,
            RepoBranch: gitHub.GitBranch,
            IsPrivate: isToggled.isPublicToggled
              ? false
              : !!isToggled.isPrivateToggled,
            AuthType: isToggled.isPublicToggled
              ? MyHubType.basic
              : privateHub === 'token'
              ? MyHubType.token
              : privateHub === 'ssh'
              ? MyHubType.ssh
              : MyHubType.basic,
            Token: accessToken,
            UserName: 'user',
            Password: 'user',
            SSHPrivateKey: sshKey.privateKey,
            SSHPublicKey: sshKey.publicKey,
          },
          projectID,
        },
      });
  };

  const handleGitURL = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setGitHub({
      HubName: gitHub.HubName,
      GitURL: event.target.value,
      GitBranch: gitHub.GitBranch,
    });
  };

  const handleGitBranch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setGitHub({
      HubName: gitHub.HubName,
      GitURL: gitHub.GitURL,
      GitBranch: event.target.value,
    });
  };

  const [copying, setCopying] = useState(false);

  // Function to copy the SSH key
  const copyTextToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      console.error('Oops Could not copy text: ');
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));
    setTimeout(() => setCopying(false), 3000);
  };

  useEffect(() => {
    /**
     * If hubName is present, this fetches the myhub configuration
     * and sets in the inputfields (for edit Myhub)
     */
    if (hubName?.length) {
      if (hubData !== undefined) {
        setGitHub({
          HubName: hubData.HubName,
          GitURL: hubData.RepoURL,
          GitBranch: hubData.RepoBranch,
        });
        if (hubData.IsPrivate) {
          setIsToggled({
            isPublicToggled: false,
            isPrivateToggled: true,
          });
        } else {
          setIsToggled({
            isPublicToggled: true,
            isPrivateToggled: false,
          });
        }
        if (hubData.AuthType === MyHubType.token) {
          setPrivateHub('token');
          setAccessToken(hubData.Token);
        } else if (hubData.AuthType === MyHubType.ssh) {
          setPrivateHub('ssh');
          setSshKey({
            privateKey: hubData.SSHPrivateKey,
            publicKey: hubData.SSHPublicKey,
          });
        } else {
          setPrivateHub('token');
        }
      }
    } else {
      /**
       * Whenever the drawer is opened, if it is not for edit MyHub,
       * the default values in the input field will be empty string
       */
      setGitHub({
        HubName: '',
        GitURL: '',
        GitBranch: '',
      });
      setSaveChanges(false);
      setSshKey({
        publicKey: '',
        privateKey: '',
      });
      setPrivateHub('token');
    }
  }, [drawerState, hubName]);

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
          <div className={classes.backBtnDiv}>
            <BackButton onClick={() => handleDrawerClose()} />
          </div>
          <Typography variant="h4" gutterBottom>
            {hubName?.length
              ? t('myhub.connectHubPage.editHub')
              : t('myhub.connectHubPage.connectHub')}
          </Typography>
        </div>
        <div className={classes.detailsDiv}>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className={classes.inputDiv}>
              <div className={classes.hubNameInput}>
                <InputField
                  data-cy="hubName"
                  label="Hub Name"
                  value={gitHub.HubName}
                  helperText={
                    validateStartEmptySpacing(gitHub.HubName)
                      ? t('myhub.validationEmptySpace')
                      : ''
                  }
                  variant={
                    validateStartEmptySpacing(gitHub.HubName)
                      ? 'error'
                      : 'primary'
                  }
                  required
                  onChange={(e) =>
                    setGitHub({
                      HubName: e.target.value,
                      GitURL: gitHub.GitURL,
                      GitBranch: gitHub.GitBranch,
                    })
                  }
                />
              </div>
              <div>
                <div className={classes.mainPrivateRepo}>
                  <div className={classes.privateRepoDiv}>
                    <GitHubToggleButton
                      isToggled={isToggled}
                      setIsToggled={setIsToggled}
                    />
                  </div>
                  {/* If Public Repo is clicked */}
                  {isToggled.isPublicToggled ? (
                    <div className={classes.inputFieldDiv}>
                      <GithubInputFields
                        gitURL={gitHub.GitURL}
                        gitBranch={gitHub.GitBranch}
                        setGitURL={handleGitURL}
                        setGitBranch={handleGitBranch}
                      />
                    </div>
                  ) : null}
                  {/* If Private Repo is Clicked */}
                  {isToggled.isPrivateToggled ? (
                    <div className={classes.privateToggleDiv}>
                      <div className={classes.privateRepoDetails}>
                        <GithubInputFields
                          gitURL={gitHub.GitURL}
                          gitBranch={gitHub.GitBranch}
                          setGitURL={handleGitURL}
                          setGitBranch={handleGitBranch}
                        />
                      </div>
                      <FormControl
                        component="fieldset"
                        className={classes.formControl}
                      >
                        <RadioGroup
                          aria-label="privateHub"
                          name="privateHub"
                          value={privateHub}
                          onChange={(e) => {
                            if (e.target.value === 'ssh') {
                              generateSSHKey();
                            }
                            if (e.target.value === 'token') {
                              setSshKey({
                                privateKey: '',
                                publicKey: '',
                              });
                            }
                            setPrivateHub(e.target.value);
                          }}
                        >
                          <FormControlLabel
                            value="token"
                            control={
                              <Radio
                                classes={{
                                  root: classes.radio,
                                  checked: classes.checked,
                                }}
                              />
                            }
                            label={
                              <Typography>
                                {t('myhub.connectHubPage.accessToken')}
                              </Typography>
                            }
                          />
                          {privateHub === 'token' ? (
                            <InputField
                              data-cy="token"
                              label="Access Token"
                              value={accessToken}
                              helperText={
                                validateStartEmptySpacing(accessToken)
                                  ? t('myhub.validationEmptySpace')
                                  : ''
                              }
                              variant={
                                validateStartEmptySpacing(accessToken)
                                  ? 'error'
                                  : 'primary'
                              }
                              required
                              onChange={(e) => setAccessToken(e.target.value)}
                            />
                          ) : null}
                          <FormControlLabel
                            className={classes.sshRadioBtn}
                            value="ssh"
                            control={
                              <Radio
                                classes={{
                                  root: classes.radio,
                                  checked: classes.checked,
                                }}
                              />
                            }
                            label={
                              <Typography>
                                {t('myhub.connectHubPage.ssh')}
                              </Typography>
                            }
                          />
                          {privateHub === 'ssh' ? (
                            <div className={classes.sshDiv}>
                              <Typography className={classes.sshAlert}>
                                {t('myhub.connectHubPage.sshAlert')}
                              </Typography>
                              <Typography className={classes.alertText}>
                                {t('myhub.connectHubPage.sshText')}
                              </Typography>
                              <div className={classes.sshDataDiv}>
                                {sshLoading ? (
                                  <Loader />
                                ) : (
                                  <>
                                    <Typography className={classes.sshText}>
                                      {sshKey.publicKey}
                                    </Typography>
                                    <div className={classes.copyBtn}>
                                      <ButtonOutlined
                                        onClick={() =>
                                          copyTextToClipboard(sshKey.publicKey)
                                        }
                                      >
                                        {!copying ? (
                                          <div className={classes.rowDiv}>
                                            <img
                                              src="./icons/copy.svg"
                                              className={classes.copyBtnImg}
                                              alt="copy"
                                            />
                                            <Typography>
                                              {t('myhub.installChaos.copy')}
                                            </Typography>
                                          </div>
                                        ) : (
                                          <div className={classes.rowDiv}>
                                            <Done className={classes.done} />
                                            <Typography>
                                              {t('myhub.installChaos.copied')}
                                            </Typography>
                                          </div>
                                        )}
                                      </ButtonOutlined>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </RadioGroup>
                      </FormControl>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={classes.btnDiv}>
                <ButtonOutlined
                  data-cy="cancel"
                  onClick={() => handleDrawerClose()}
                  className={classes.cancelBtn}
                >
                  {t('myhub.connectHubPage.cancel')}
                </ButtonOutlined>
                <ButtonFilled
                  style={{ width: 140 }}
                  variant="success"
                  data-cy="MyHubSubmit"
                  type="submit"
                  disabled={
                    !isValidWebUrl(gitHub.GitURL) ||
                    validateStartEmptySpacing(gitHub.GitBranch) ||
                    loading ||
                    updateHubLoader
                  }
                >
                  {loading || updateHubLoader ? (
                    <Loader size={20} />
                  ) : saveChanges ? (
                    'Save Changes'
                  ) : (
                    t('myhub.connectHubPage.submitBtn')
                  )}
                </ButtonFilled>
              </div>
            </div>
          </form>
        </div>
      </>
    </Drawer>
  );
};

export default MyHubConnectDrawer;
