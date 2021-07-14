import { useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GithubInputFields from '../../../components/GitHubComponents/GithubInputFields/GithubInputFields';
import Loader from '../../../components/Loader';
import {
  DISABLE_GITOPS,
  ENABLE_GITOPS,
  GENERATE_SSH,
  UPDATE_GITOPS,
} from '../../../graphql/mutations';
import { GET_GITOPS_DATA } from '../../../graphql/queries';
import { GitOpsDetail } from '../../../models/graphql/gitOps';
import { MyHubType, SSHKey, SSHKeys } from '../../../models/graphql/user';
import { getProjectID } from '../../../utils/getSearchParams';
import { validateStartEmptySpacing } from '../../../utils/validate';
import GitOpsInfo from './gitOpsInfo';
import SSHField from './sshField';
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
  const projectID = getProjectID();
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
  const [confirmModal, setConfirmModal] = useState(false);

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
  const { data, refetch, loading } = useQuery<GitOpsDetail>(GET_GITOPS_DATA, {
    variables: { data: projectID },
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

  // State variable to check if gitops is enable or not (required for edit gitops)
  const [isGitOpsEnabled, setIsGitOpsEnabled] = useState(false);

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
      setIsGitOpsEnabled(true);
    },
  });

  // Mutation to enable GitOps
  const [updateGitOps, { loading: updateGitOpsLoader }] = useMutation(
    UPDATE_GITOPS,
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
          message: 'Successfully updated GitOps!',
        });
        setIsGitOpsEnabled(true);
      },
    }
  );

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
        setGitHub({
          GitBranch: '',
          GitURL: '',
        });
        setSshKey({
          publicKey: '',
          privateKey: '',
        });
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
  const onEditClicked = () => {
    setConfirmModal(true);
  };

  const onConfirmEdit = () => {
    setIsGitOpsEnabled(false);
    setGitHub({
      GitURL: data?.getGitOpsDetails.RepoURL || '',
      GitBranch: data?.getGitOpsDetails.Branch || '',
    });
    setPrivateHub('');
    setAccessToken('');
    setSshKey({
      publicKey: '',
      privateKey: '',
    });
    setConfirmModal(false);
  };

  const onCancelEdit = () => {
    setConfirmModal(false);
  };

  // UseEffect to set the initial state of radio-buttons
  useEffect(() => {
    if (data !== undefined) {
      if (data.getGitOpsDetails.Enabled) {
        setValue('enabled');
        setIsGitOpsEnabled(true);
      } else {
        setValue('disabled');
        setIsGitOpsEnabled(false);
      }
    }
  }, [data]);

  // Handle submit button to call the enableGitOps mutation
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === 'enabled') {
      if (data?.getGitOpsDetails.Enabled === false) {
        enableGitOps({
          variables: {
            gitConfig: {
              ProjectID: projectID,
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
      if (data?.getGitOpsDetails.Enabled === true) {
        updateGitOps({
          variables: {
            gitConfig: {
              ProjectID: projectID,
              RepoURL: gitHub.GitURL,
              Branch: gitHub.GitBranch,
              AuthType:
                privateHub === ''
                  ? data?.getGitOpsDetails.AuthType
                  : privateHub === 'token'
                  ? MyHubType.token
                  : privateHub === 'ssh'
                  ? MyHubType.ssh
                  : MyHubType.none,
              Token:
                privateHub === '' ? data?.getGitOpsDetails.Token : accessToken,
              UserName: 'user',
              Password: 'user',
              SSHPrivateKey:
                privateHub === ''
                  ? data?.getGitOpsDetails.SSHPrivateKey
                  : sshKey.privateKey,
            },
          },
        });
      }
    }
  };

  return (
    <div className={classes.container}>
      {loading ? (
        <Loader />
      ) : (
        <>
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
                        classes={{
                          root: classes.radio,
                          checked: classes.checked,
                        }}
                      />
                    }
                    data-cy="localRadioButton"
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
                        data-cy="disableGitopsButton"
                        disabled={disableGitOpsLoader}
                        onClick={() =>
                          disableGitOps({
                            variables: {
                              data: projectID,
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
                      data-cy="gitopsRadioButton"
                      label={
                        <Typography style={{ fontSize: '20px' }}>
                          {t('settings.gitopsTab.repo')}
                        </Typography>
                      }
                    />

                    {isGitOpsEnabled === false ? (
                      <div>
                        <Typography className={classes.infoText}>
                          {t('settings.gitopsTab.desc')}
                        </Typography>
                        {value === 'enabled' ? (
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
                                    data-cy="accessTokenRadioButton"
                                    label={
                                      <Typography>
                                        {t('myhub.connectHubPage.accessToken')}
                                      </Typography>
                                    }
                                  />
                                  {privateHub === 'token' ? (
                                    <InputField
                                      data-cy="accessTokenInput"
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
                                      onChange={(e) =>
                                        setAccessToken(e.target.value)
                                      }
                                    />
                                  ) : null}
                                  <FormControlLabel
                                    className={classes.sshRadioBtn}
                                    data-cy="sshKeyRadioButton"
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
                                    <SSHField
                                      sshLoading={sshLoading}
                                      copying={copying}
                                      publicKey={sshKey.publicKey}
                                      copyPublicKey={copyTextToClipboard}
                                    />
                                  ) : null}
                                  <div
                                    className={classes.submitBtnDiv}
                                    data-cy="connectButton"
                                  >
                                    <ButtonFilled
                                      type="submit"
                                      disabled={
                                        gitOpsLoader || updateGitOpsLoader
                                      }
                                    >
                                      {updateGitOpsLoader || gitOpsLoader ? (
                                        <Loader size={20} />
                                      ) : (
                                        <Typography>
                                          {data?.getGitOpsDetails.Enabled
                                            ? 'Update'
                                            : t('settings.gitopsTab.connect')}
                                        </Typography>
                                      )}
                                    </ButtonFilled>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : isGitOpsEnabled === true ? (
                      <GitOpsInfo
                        data={data}
                        onEditClicked={onEditClicked}
                        modalState={confirmModal}
                        onModalClick={onConfirmEdit}
                        onModalCancel={onCancelEdit}
                      />
                    ) : null}
                  </div>
                  <img
                    src="./icons/gitops-image.svg"
                    alt="Gitops"
                    style={{ marginLeft: 'auto', paddingLeft: 20 }}
                  />
                </div>
              </RadioGroup>
            </FormControl>
          </form>
          <Modal
            data-cy="gitopsModal"
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
                      src="./icons/red-cross.svg"
                      alt="checkmark"
                      className={classes.checkImg}
                    />
                    <Typography gutterBottom className={classes.modalHeading}>
                      <strong>Error: {gitopsResult.message}</strong>
                    </Typography>
                    <ButtonFilled onClick={handleClose} data-cy="closeButton">
                      {t('settings.gitopsTab.setting')}
                    </ButtonFilled>
                  </div>
                ) : null}
                <div>
                  {gitopsResult.type === 'success' ? (
                    <>
                      <img
                        src="./icons/checkmark.svg"
                        alt="checkmark"
                        className={classes.checkImg}
                      />
                      <Typography gutterBottom className={classes.modalHeading}>
                        {gitopsResult.message}
                      </Typography>

                      <ButtonFilled onClick={handleClose} data-cy="closeButton">
                        {t('settings.gitopsTab.setting')}
                      </ButtonFilled>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};
export default GitOpsTab;
