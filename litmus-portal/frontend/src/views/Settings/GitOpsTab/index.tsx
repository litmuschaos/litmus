import { useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { Done } from '@material-ui/icons';
import { ButtonFilled, ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import GithubInputFields from '../../../components/GitHubComponents/GithubInputFields/GithubInputFields';
import Loader from '../../../components/Loader';
import {
  DISABLE_GITOPS,
  ENABLE_GITOPS,
  GENERATE_SSH,
} from '../../../graphql/mutations';
import { GET_GITOPS_DATA } from '../../../graphql/queries';
import { GitOpsDetail } from '../../../models/graphql/gitOps';
import { MyHubType, SSHKey, SSHKeys } from '../../../models/graphql/user';
import { RootState } from '../../../redux/reducers';
import { validateStartEmptySpacing } from '../../../utils/validate';
import useStyles from './styles';

interface GitHub {
  GitURL: string;
  GitBranch: string;
}

interface GitOpsResult {
  type: string;
  message: string;
}

const GitOpsTab = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState('disabled');
  const userData = useSelector((state: RootState) => state.userData);
  const { t } = useTranslation();
  // Local State Variables for Github Data and GitOps result data
  const [gitHub, setGitHub] = useState<GitHub>({
    GitURL: '',
    GitBranch: '',
  });
  const [gitopsResult, setGitOpsResult] = useState<GitOpsResult>({
    type: '',
    message: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [sshKey, setSshKey] = useState<SSHKey>({
    privateKey: '',
    publicKey: '',
  });
  const [accessToken, setAccessToken] = useState('');

  // State Variable for AuthType Radio Buttons
  const [privateHub, setPrivateHub] = useState('token');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  // Functions to handle the events
  const handleGitURL = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setGitHub({
      GitURL: event.target.value,
      GitBranch: gitHub.GitBranch,
    });
  };

  const handleGitBranch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setGitHub({
      GitURL: gitHub.GitURL,
      GitBranch: event.target.value,
    });
  };

  // Query to fetch GitOps Data
  const { data, refetch } = useQuery<GitOpsDetail>(GET_GITOPS_DATA, {
    variables: { data: userData.selectedProjectID },
    fetchPolicy: 'cache-and-network',
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

  // Mutation to enable GitOps
  const [enableGitOps, { loading: gitOpsLoader }] = useMutation(ENABLE_GITOPS, {
    onError: (data) => {
      setIsOpen(true);
      setGitOpsResult({
        type: 'fail',
        message: data.message,
      });
    },
    onCompleted: () => {
      setIsOpen(true);
      setGitOpsResult({
        type: 'success',
        message: 'Successfully enabled GitOps!',
      });
    },
  });

  // Mutation to disable GitOps
  const [disableGitOps, { loading: disableGitOpsLoader }] = useMutation(
    DISABLE_GITOPS,
    {
      onError: (data) => {
        setIsOpen(true);
        setGitOpsResult({
          type: 'fail',
          message: data.message,
        });
      },
      onCompleted: () => {
        setIsOpen(true);
        setGitOpsResult({
          type: 'success',
          message: 'Successfully disabled GitOps!',
        });
      },
    }
  );

  const handleClose = () => {
    setIsOpen(false);
    refetch();
  };

  // UseEffect to set the initial state of radio-buttons
  useEffect(() => {
    if (data !== undefined) {
      if (data.getGitOpsDetails.Enabled) {
        setValue('enabled');
      } else {
        setValue('disabled');
      }
    }
  }, [data]);

  // Handle submit button to call the enableGitOps mutation
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === 'enabled') {
      enableGitOps({
        variables: {
          gitConfig: {
            ProjectID: userData.selectedProjectID,
            RepoURL: gitHub.GitURL,
            Branch: gitHub.GitBranch,
            AuthType:
              privateHub === 'token'
                ? MyHubType.token
                : privateHub === 'ssh'
                ? MyHubType.ssh
                : MyHubType.none,
            Token: accessToken,
            UserName: 'user',
            Password: 'user',
            SSHPrivateKey: sshKey.privateKey,
          },
        },
      });
    }
  };

  return (
    <div className={classes.container}>
      <Typography className={classes.headerText}>
        <strong>{t('settings.gitopsTab.choose')} </strong>
      </Typography>
      <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
        <FormControl component="fieldset" style={{ width: '70%' }}>
          <RadioGroup name="gitops" value={value} onChange={handleChange}>
            <div className={classes.mainRadioDiv}>
              <FormControlLabel
                value="disabled"
                control={
                  <Radio
                    classes={{ root: classes.radio, checked: classes.checked }}
                  />
                }
                label={
                  <Typography className={classes.locallyText}>
                    {t('settings.gitopsTab.locally')}
                  </Typography>
                }
              />
              {value === 'disabled' &&
              data?.getGitOpsDetails.Enabled === true ? (
                <div>
                  <Typography className={classes.disconnectText}>
                    {t('settings.gitopsTab.disconnect')}
                  </Typography>
                  <ButtonFilled
                    disabled={disableGitOpsLoader}
                    onClick={() =>
                      disableGitOps({
                        variables: {
                          data: userData.selectedProjectID,
                        },
                      })
                    }
                  >
                    {t('settings.gitopsTab.save')}
                  </ButtonFilled>
                </div>
              ) : null}
            </div>
            <div className={classes.enabledText}>
              <div>
                <FormControlLabel
                  value="enabled"
                  control={
                    <Radio
                      classes={{
                        root: classes.radio,
                        checked: classes.checked,
                      }}
                    />
                  }
                  label={
                    <Typography style={{ fontSize: '20px' }}>
                      {t('settings.gitopsTab.repo')}
                    </Typography>
                  }
                />

                {data?.getGitOpsDetails.Enabled === false ? (
                  <div>
                    <Typography className={classes.infoText}>
                      {t('settings.gitopsTab.desc')}
                    </Typography>
                    <div className={classes.mainPrivateRepo}>
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
                                        <ButtonOutlined
                                          onClick={() =>
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
                                        </ButtonOutlined>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : null}
                            <div className={classes.submitBtnDiv}>
                              <ButtonFilled
                                type="submit"
                                disabled={gitOpsLoader || value !== 'enabled'}
                              >
                                <Typography>
                                  {t('settings.gitopsTab.connect')}
                                </Typography>
                              </ButtonFilled>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                ) : data?.getGitOpsDetails.Enabled === true ? (
                  <div className={classes.gitInfo}>
                    <Typography className={classes.branchText}>
                      <strong>{data?.getGitOpsDetails.Branch}</strong>
                    </Typography>
                    <Typography className={classes.branch}>
                      {t('settings.gitopsTab.branch')}
                    </Typography>
                    <Typography className={classes.repoURLText}>
                      <strong> {data?.getGitOpsDetails.RepoURL}</strong>
                    </Typography>
                    <Typography className={classes.gitURL}>
                      {' '}
                      {t('settings.gitopsTab.URL')}
                    </Typography>
                  </div>
                ) : null}
              </div>
              <img
                src="/icons/gitops-image.svg"
                alt="Gitops"
                style={{ marginLeft: 'auto', paddingLeft: 20 }}
              />
            </div>
          </RadioGroup>
        </FormControl>
      </form>
      <Modal
        open={isOpen}
        onClose={handleClose}
        modalActions={
          <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
        }
      >
        <div className={classes.modalDiv}>
          <div>
            {gitopsResult.type === 'fail' ? (
              <div>
                <img
                  src="/icons/red-cross.svg"
                  alt="checkmark"
                  className={classes.checkImg}
                />
                <Typography gutterBottom className={classes.modalHeading}>
                  <strong>Error: {gitopsResult.message}</strong>
                </Typography>
                <ButtonFilled onClick={handleClose}>
                  {t('settings.gitopsTab.setting')}
                </ButtonFilled>
              </div>
            ) : null}
            <div>
              {gitopsResult.type === 'success' ? (
                <>
                  <img
                    src="/icons/checkmark.svg"
                    alt="checkmark"
                    className={classes.checkImg}
                  />
                  <Typography gutterBottom className={classes.modalHeading}>
                    {gitopsResult.message}
                  </Typography>

                  <ButtonFilled onClick={handleClose}>
                    {t('settings.gitopsTab.setting')}
                  </ButtonFilled>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default GitOpsTab;
