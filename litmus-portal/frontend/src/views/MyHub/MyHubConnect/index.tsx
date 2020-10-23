import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import BackButton from '../../../components/Button/BackButton';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import InputField from '../../../components/InputField';
import QuickActionCard from '../../../components/QuickActionCard';
import VideoCarousel from '../../../components/VideoCarousel';
import Scaffold from '../../../containers/layouts/Scaffold';
import Unimodal from '../../../containers/layouts/Unimodal';
import {
  isValidWebUrl,
  validateStartEmptySpacing,
} from '../../../utils/validate';
import useStyles from './styles';
import { history } from '../../../redux/configureStore';
import { ADD_MY_HUB } from '../../../graphql/mutations';
import { RootState } from '../../../redux/reducers';
import Loader from '../../../components/Loader';

interface GitHub {
  HubName: string;
  GitURL: string;
  GitBranch: string;
}

const MyHub = () => {
  const classes = useStyles();
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
          GitURL: gitHub.GitURL,
          GitBranch: gitHub.GitBranch,
        },
        Username: userData.username,
      },
    });
    setCloningRepo(true);
    setIsOpen(true);
  };
  return (
    <Scaffold>
      <div className={classes.header}>
        <div className={classes.btnDiv}>
          <BackButton isDisabled={false} />
        </div>
        <Typography variant="h3" gutterBottom>
          Connect a new chaos hub
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        <div className={classes.detailsDiv}>
          <Typography variant="h4" gutterBottom />
          <Typography className={classes.enterInfoText}>
            <strong>Enter information in the required fields</strong>
          </Typography>

          <Typography className={classes.connectText}>
            Then click on the connect button
          </Typography>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className={classes.inputDiv}>
              <div className={classes.inputField}>
                <InputField
                  label="Hub Name"
                  value={gitHub.HubName}
                  helperText={
                    validateStartEmptySpacing(gitHub.HubName)
                      ? 'Should not start with an empty space'
                      : ''
                  }
                  validationError={validateStartEmptySpacing(gitHub.HubName)}
                  required
                  handleChange={(e) =>
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
                  validationError={!isValidWebUrl(gitHub.GitURL)}
                  required
                  handleChange={(e) =>
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
                  validationError={validateStartEmptySpacing(gitHub.GitBranch)}
                  required
                  handleChange={(e) =>
                    setGitHub({
                      HubName: gitHub.HubName,
                      GitURL: gitHub.GitURL,
                      GitBranch: e.target.value,
                    })
                  }
                />
              </div>
              <div className={classes.btnDiv}>
                <ButtonFilled isPrimary={false} type="submit">
                  Submit Now
                </ButtonFilled>
              </div>
              <Unimodal open={isOpen} handleClose={handleClose} hasCloseBtn>
                <div className={classes.modalDiv}>
                  {cloningRepo ? (
                    <div>
                      <Loader />
                      <Typography className={classes.modalDesc}>
                        Please wait while we are cloning your repo!
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
                            <strong>Error</strong> while creating MyHub
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
                            style={{ marginBottom: 20 }}
                          />
                          <Typography
                            gutterBottom
                            className={classes.modalHeading}
                          >
                            A new chaos hub <br /> is successfully created
                          </Typography>
                          <Typography className={classes.modalDesc}>
                            A new chaos hub will be added to the main page of
                            the My hubs section
                          </Typography>
                          <ButtonFilled
                            isPrimary={false}
                            handleClick={handleClose}
                          >
                            Back to my hubs
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
            Get resilient and compliance scores for your Kuberenetes product
          </Typography>
          <div style={{ marginLeft: 45 }}>
            <QuickActionCard />
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
