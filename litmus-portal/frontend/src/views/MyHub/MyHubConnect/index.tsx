import { useMutation } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Done from '@material-ui/icons/DoneAllTwoTone';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/Button/BackButton';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import GithubInputFields from '../../../components/GitHubComponents/GithubInputFields/GithubInputFields';
import GitHubToggleButton from '../../../components/GitHubComponents/GitHubToggleButtons/GitHubToggleButton';
import Loader from '../../../components/Loader';
import QuickActionCard from '../../../components/QuickActionCard';
import VideoCarousel from '../../../components/VideoCarousel';
import Scaffold from '../../../containers/layouts/Scaffold';
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
import { history } from '../../../redux/configureStore';
import { getProjectID } from '../../../utils/getSearchParams';
import { validateStartEmptySpacing } from '../../../utils/validate';
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

interface SaveLater {
  saveLater: boolean;
}

const MyHub: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const [gitHub, setGitHub] = useState<GitHub>({
    HubName: '',
    GitURL: '',
    GitBranch: '',
  });
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cloningRepo, setCloningRepo] = useState(false);
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

  const [savingHub, setSavingHub] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const [addMyHub] = useMutation<MyHubData, CreateMyHub>(ADD_MY_HUB, {
    onCompleted: () => {
      setCloningRepo(false);
    },
    onError: (error) => {
      setCloningRepo(false);
      setError(error.message);
    },
  });

  const [saveMyHub, { error: saveError }] = useMutation<MyHubData, CreateMyHub>(
    SAVE_MY_HUB,
    {
      onCompleted: () => {
        setSavingHub(false);
      },
      onError: () => {
        setSavingHub(false);
      },
    }
  );

  const handleClose = () => {
    setIsOpen(false);
    setIsSaveOpen(false);
    history.push({ pathname: '/myhub' });
  };

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
    setCloningRepo(true);
    setIsOpen(true);
  };

  const handleSave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
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
    setSavingHub(true);
    setIsSaveOpen(true);
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

  const SuccessContent: React.FC<SaveLater> = ({ saveLater }) => {
    return (
      <>
        <img
          src="/icons/checkmark.svg"
          alt="checkmark"
          className={classes.checkImg}
        />
        <Typography gutterBottom className={classes.modalHeading}>
          {t('myhub.connectHubPage.newHub')} <br />{' '}
          {t('myhub.connectHubPage.success')}
        </Typography>
        <Typography className={classes.modalDesc}>
          {saveLater
            ? t('myhub.connectHubPage.updateHub')
            : t('myhub.connectHubPage.newHubCreated')}
        </Typography>
        <ButtonFilled isPrimary={false} handleClick={handleClose}>
          {t('myhub.connectHubPage.myHub')}
        </ButtonFilled>
      </>
    );
  };

  return (
    <Scaffold>
      <div className={classes.header}>
        <div className={classes.backBtnDiv}>
          <BackButton isDisabled={false} />
        </div>
        <Typography variant="h3" gutterBottom>
          {t('myhub.connectHubPage.connectHub')}
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        <div className={classes.detailsDiv}>
          <Typography variant="h4" gutterBottom />
          <Typography className={classes.enterInfoText}>
            <strong>{t('myhub.connectHubPage.enterInfo')}</strong>
          </Typography>
          <Typography className={classes.connectText}>
            {t('myhub.connectHubPage.connectBtn')}
          </Typography>
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
                                      <ButtonOutline
                                        isDisabled={false}
                                        handleClick={() =>
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
                                      </ButtonOutline>
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
              <div className={classes.submitBtnDiv}>
                <ButtonFilled isPrimary={false} type="submit">
                  {t('myhub.connectHubPage.submitBtn')}
                </ButtonFilled>
              </div>
              <Modal
                open={isOpen}
                onClose={handleClose}
                modalActions={
                  <ButtonOutlined onClick={handleClose}>
                    &#x2715;
                  </ButtonOutlined>
                }
              >
                <div className={classes.modalDiv}>
                  {cloningRepo ? (
                    <div>
                      <Loader />
                      <Typography className={classes.modalDesc}>
                        {t('myhub.connectHubPage.cloningText')}
                      </Typography>
                    </div>
                  ) : (
                    <div>
                      {error.length ? (
                        <div>
                          <Typography
                            gutterBottom
                            className={classes.modalHeading}
                          >
                            <strong>
                              {t('myhub.connectHubPage.errorText')}
                            </strong>{' '}
                            {t('myhub.connectHubPage.creatingHub')}
                          </Typography>
                          <Typography className={classes.modalDesc}>
                            Error: {error}
                          </Typography>
                          {error.toLowerCase() ===
                          'hubname already exists' ? null : (
                            <ButtonFilled
                              isPrimary={false}
                              handleClick={handleSave}
                            >
                              {t('myhub.connectHubPage.saveLater')}
                            </ButtonFilled>
                          )}
                        </div>
                      ) : (
                        <SuccessContent saveLater={false} />
                      )}
                    </div>
                  )}
                </div>
              </Modal>
              <Modal
                open={isSaveOpen}
                onClose={handleClose}
                modalActions={
                  <ButtonOutlined onClick={handleClose}>
                    &#x2715;
                  </ButtonOutlined>
                }
              >
                <div className={classes.modalDiv}>
                  {savingHub ? (
                    <div>
                      <Loader />
                      <Typography className={classes.modalDesc}>
                        {t('myhub.connectHubPage.saveLaterDesc')}
                      </Typography>
                    </div>
                  ) : (
                    <div>
                      {saveError?.message.length ? (
                        <div>
                          <Typography
                            gutterBottom
                            className={classes.modalHeading}
                          >
                            <strong>
                              {t('myhub.connectHubPage.errorText')}
                            </strong>{' '}
                            {t('myhub.connectHubPage.creatingHub')}
                          </Typography>
                          <Typography className={classes.modalDesc}>
                            Error: {saveError.message}
                          </Typography>
                        </div>
                      ) : (
                        <SuccessContent saveLater />
                      )}
                    </div>
                  )}
                </div>
              </Modal>
            </div>
          </form>
        </div>
        <div className={classes.root}>
          <VideoCarousel />
          <Typography className={classes.videoDescription}>
            {t('myhub.connectHubPage.videoDesc')}
          </Typography>
          <div className={classes.quickActionDiv}>
            <QuickActionCard />
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
