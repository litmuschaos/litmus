import { useMutation } from '@apollo/client';
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
import {
  ADD_MY_HUB,
  GENERATE_SSH,
  SAVE_MY_HUB,
} from '../../../graphql/mutations';
import {
  CreateMyHub,
  MyHubData,
  MyHubType,
  SSHKey,
  SSHKeys,
} from '../../../models/graphql/user';
import { getProjectID } from '../../../utils/getSearchParams';
import {
  isValidWebUrl,
  validateStartEmptySpacing,
} from '../../../utils/validate';
import useStyles from './styles';
import { constants } from '../../../constants';

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
  drawerState: boolean;
  handleDrawerClose: () => void;
  refetchQuery: () => void;
  setAlertState: (alertState: boolean) => void;
  setAlertResult: (alertResult: CloneResult) => void;
}

const MyHubConnectDrawer: React.FC<MyHubConnectDrawerProps> = ({
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

  const [saveChanges, setSaveChanges] = useState(false);

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

  // Mutation to generate SSH key
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
    if (saveChanges) {
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
  }, [drawerState]);

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
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
            {t('myhub.connectHubPage.connectHub')}
          </Typography>
        </div>
        <div className={classes.detailsDiv}>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className={classes.inputDiv}>
              <div className={classes.hubNameInput}>
                <InputField
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
                                              src="/icons/copy.svg"
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
                <ButtonOutlined className={classes.cancelBtn}>
                  {t('myhub.connectHubPage.cancel')}
                </ButtonOutlined>
                <ButtonFilled
                  style={{ width: 140 }}
                  variant="success"
                  type="submit"
                  disabled={
                    !isValidWebUrl(gitHub.GitURL) ||
                    validateStartEmptySpacing(gitHub.GitBranch) ||
                    loading
                  }
                >
                  {loading ? (
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
