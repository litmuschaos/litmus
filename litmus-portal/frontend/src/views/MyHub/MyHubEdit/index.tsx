import { useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { Done } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { InputField } from 'kubera-ui';
import BackButton from '../../../components/Button/BackButton';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import Loader from '../../../components/Loader';
import QuickActionCard from '../../../components/QuickActionCard';
import Scaffold from '../../../containers/layouts/Scaffold';
import Unimodal from '../../../containers/layouts/Unimodal';
import { GENERATE_SSH, GET_HUB_STATUS, UPDATE_MY_HUB } from '../../../graphql';
import { history } from '../../../redux/configureStore';
import {
  CreateMyHub,
  MyHubData,
  MyHubType,
  SSHKey,
  SSHKeys,
} from '../../../models/graphql/user';
import { HubStatus } from '../../../models/redux/myhub';
import { RootState } from '../../../redux/reducers';
import { validateStartEmptySpacing } from '../../../utils/validate';
import MyHubInput from '../MyHubConnect/myHubInput';
import MyHubToggleButtons from '../MyHubConnect/toggleButton';
import useStyles from './styles';
import VideoCarousel from '../../../components/VideoCarousel';

interface MyHubParams {
  hubname: string;
}

interface GitHub {
  HubName: string;
  GitURL: string;
  GitBranch: string;
}

interface MyHubToggleProps {
  isPublicToggled: boolean;
  isPrivateToggled: boolean;
}

const MyHub = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userData = useSelector((state: RootState) => state.userData);
  const { data, loading } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: userData.selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });
  const params: MyHubParams = useParams();
  const hubData = data?.getHubStatus.filter(
    (hubs) => hubs.HubName === params.hubname
  )[0];

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
  const [copying, setCopying] = useState(false);

  const [updateMyHub] = useMutation<MyHubData, CreateMyHub>(UPDATE_MY_HUB, {
    onCompleted: () => {
      setCloningRepo(false);
    },
    onError: (error) => {
      setCloningRepo(false);
      setError(error.message);
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

  useEffect(() => {
    if (hubData !== undefined) {
      setGitHub({
        HubName: hubData?.HubName,
        GitURL: hubData?.RepoURL,
        GitBranch: hubData?.RepoBranch,
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
  }, [hubData]);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        projectID: userData.selectedProjectID,
      },
    });
    setCloningRepo(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    history.push({ pathname: '/myhub' });
  };

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
  return (
    <Scaffold>
      <div className={classes.header}>
        <div className={classes.backBtnDiv}>
          <BackButton isDisabled={false} />
        </div>
        <Typography variant="h3" gutterBottom>
          {t('myhub.editPage.edit')}
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        {loading ? (
          <Loader />
        ) : (
          <div className={classes.detailsDiv}>
            <Typography variant="h4" gutterBottom />
            <Typography className={classes.enterInfoText}>
              <strong>{t('myhub.connectHubPage.enterInfo')}</strong>
            </Typography>
            <Typography className={classes.connectText}>
              {t('myhub.editPage.click')}
            </Typography>
            <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
              <div className={classes.inputDiv}>
                <div className={classes.inputField}>
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
                      <MyHubToggleButtons
                        isToggled={isToggled}
                        setIsToggled={setIsToggled}
                      />
                    </div>
                    {/* If Public Repo is clicked */}
                    {isToggled.isPublicToggled ? (
                      <div className={classes.inputFieldDiv}>
                        <MyHubInput
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
                          <MyHubInput
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
                                            copyTextToClipboard(
                                              sshKey.publicKey
                                            )
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
                    {t('myhub.editPage.submit')}
                  </ButtonFilled>
                </div>
                <Unimodal open={isOpen} handleClose={handleClose} hasCloseBtn>
                  <div className={classes.modalDiv}>
                    {cloningRepo ? (
                      <div>
                        <Loader />
                        <Typography className={classes.modalDesc}>
                          {t('myhub.editPage.wait')}
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
                              <strong>{t('myhub.editPage.error')}</strong>{' '}
                            </Typography>
                            <Typography className={classes.modalDesc}>
                              Error: {error}
                            </Typography>
                          </div>
                        ) : (
                          <>
                            <img
                              src="/icons/checkmark.svg"
                              alt="checkmark"
                              className={classes.checkImg}
                            />
                            <Typography
                              gutterBottom
                              className={classes.modalHeading}
                            >
                              {t('myhub.editPage.success')}
                            </Typography>
                            <Typography className={classes.modalDesc}>
                              {t('myhub.editPage.desc')}
                            </Typography>
                            <ButtonFilled
                              isPrimary={false}
                              handleClick={handleClose}
                            >
                              {t('myhub.connectHubPage.myHub')}
                            </ButtonFilled>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Unimodal>
              </div>
            </form>
          </div>
        )}
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
