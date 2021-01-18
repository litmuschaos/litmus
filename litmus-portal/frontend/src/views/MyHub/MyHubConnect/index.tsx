import { useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { InputField } from 'kubera-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../../components/Button/BackButton';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import Loader from '../../../components/Loader';
import QuickActionCard from '../../../components/QuickActionCard';
import VideoCarousel from '../../../components/VideoCarousel';
import Scaffold from '../../../containers/layouts/Scaffold';
import Unimodal from '../../../containers/layouts/Unimodal';
import { ADD_MY_HUB } from '../../../graphql/mutations';
import { history } from '../../../redux/configureStore';
import { RootState } from '../../../redux/reducers';
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

const MyHub = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userData = useSelector((state: RootState) => state.userData);
  const [gitHub, setGitHub] = useState<GitHub>({
    HubName: '',
    GitURL: '',
    GitBranch: '',
  });
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cloningRepo, setCloningRepo] = useState(false);
  const [addMyHub] = useMutation(ADD_MY_HUB, {
    onCompleted: () => {
      setCloningRepo(false);
    },
    onError: (error) => {
      setCloningRepo(false);
      setError(error.message);
    },
  });
  const handleClose = () => {
    setIsOpen(false);
    history.push({ pathname: '/myhub' });
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addMyHub({
      variables: {
        MyHubDetails: {
          HubName: gitHub.HubName,
          RepoURL: gitHub.GitURL,
          RepoBranch: gitHub.GitBranch,
        },
        projectID: userData.selectedProjectID,
      },
    });
    setCloningRepo(true);
    setIsOpen(true);
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
                      ? 'Should not start with an empty space'
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
              <div className={classes.inputField}>
                <InputField
                  label="Git URL"
                  value={gitHub.GitURL}
                  helperText={
                    !isValidWebUrl(gitHub.GitURL) ? 'Enter a valid URL' : ''
                  }
                  variant={isValidWebUrl(gitHub.GitURL) ? 'error' : 'primary'}
                  required
                  onChange={(e) =>
                    setGitHub({
                      HubName: gitHub.HubName,
                      GitURL: e.target.value,
                      GitBranch: gitHub.GitBranch,
                    })
                  }
                />
              </div>
              <div className={classes.inputField}>
                <InputField
                  label="Branch"
                  value={gitHub.GitBranch}
                  helperText={
                    validateStartEmptySpacing(gitHub.GitBranch)
                      ? 'Should not start with an empty space'
                      : ''
                  }
                  variant={
                    validateStartEmptySpacing(gitHub.GitBranch)
                      ? 'error'
                      : 'primary'
                  }
                  required
                  onChange={(e) =>
                    setGitHub({
                      HubName: gitHub.HubName,
                      GitURL: gitHub.GitURL,
                      GitBranch: e.target.value,
                    })
                  }
                />
              </div>
              <div className={classes.submitBtnDiv}>
                <ButtonFilled isPrimary={false} type="submit">
                  {t('myhub.connectHubPage.submitBtn')}
                </ButtonFilled>
              </div>
              <Unimodal open={isOpen} handleClose={handleClose} hasCloseBtn>
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
                            {t('myhub.connectHubPage.newHub')} <br />{' '}
                            {t('myhub.connectHubPage.success')}
                          </Typography>
                          <Typography className={classes.modalDesc}>
                            {t('myhub.connectHubPage.newHubCreated')}
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
